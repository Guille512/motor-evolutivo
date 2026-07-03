#!/usr/bin/env node
/**
 * watch-sensores.js — Score-collector del Motor Evolutivo (0 tokens LLM)
 *
 * Autonomía acotada: automatiza la EVIDENCIA, nunca la DECISIÓN. Cuando tu agente
 * aplica una jugada MEDIBLE, registra su sensor acá. Este script corre por
 * cron/Task Scheduler, mide los sensores cuya ventana venció (API directas, sin
 * LLM), propone el score de la métrica v1.3 con la evidencia pegada y avisa por
 * Telegram. El score queda como BORRADOR: solo cuenta para la curva cuando el
 * humano lo confirma en sesión.
 *
 * Tipos de sensor incluidos: `n8n-errores` (ejecuciones con error de un workflow
 * N8N) y `nocodb-count` (count de una tabla NocoDB con filtro). Para otro stack,
 * agregá tu tipo en medir() — es un switch de ~10 líneas por integración.
 *
 * Registro: scripts/.state/sensores.json → { "sensores": [ ... ] }
 * Formato de un sensor (lo escribe el agente en sesión al aplicar la jugada):
 * {
 *   "id": "proyecto-jugada-2026-07-03",     // único, kebab
 *   "jugada": "dedup de recordatorios",
 *   "tipo": "n8n-errores" | "nocodb-count",
 *   "envPrefix": "PROD",                     // n8n-errores → N8N_API_URL_<P>/N8N_API_KEY_<P>
 *   "wfId": "abc123",                        // n8n-errores
 *   "url": "https://.../records/count?...",  // nocodb-count (URL completa, con where)
 *   "tokenEnv": "NOCODB_API_TOKEN",          // nocodb-count (header xc-token)
 *   "ventanaDias": 7,
 *   "umbral": 0,                             // scorePropuesto 1.0 si conteo <= umbral, sino 0
 *   "aplicada": "2026-07-03",                // fecha en que la jugada tocó prod
 *   "estado": "pendiente"                    // → "medido" (la reflexión lo pasa a bitácora y lo saca)
 * }
 *
 * Config (.env en la raíz del repo): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 * + las credenciales de tu stack (N8N_API_URL_*, NOCODB_API_TOKEN, ...).
 *
 * Uso:
 *   node scripts/watch-sensores.js              # mide vencidos, Telegram si hay resultados
 *   node scripts/watch-sensores.js --summary    # lista todos los sensores y su estado
 *   node scripts/watch-sensores.js --dry-run    # mide pero NO manda Telegram ni persiste
 *   node scripts/watch-sensores.js --self-test  # chequeo de la lógica de score, sin red
 *
 * Exit codes: 0 OK/sin vencidos · 1 falló Telegram · 2 error de config
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const STATE_DIR = path.join(__dirname, '.state');
const STATE_FILE = path.join(STATE_DIR, 'sensores.json');
const TIMEOUT_MS = 15000;
const DAY_MS = 24 * 3600 * 1000;
// Offset horario para interpretar la fecha "aplicada" (ej: "-03:00" = ART).
const TZ_OFFSET = process.env.MOTOR_TZ_OFFSET || '-03:00';

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return null;
  const env = {};
  for (const rawLine of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

function request({ url, headers = {}, method = 'GET', body }) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method,
      headers: { ...headers, Accept: 'application/json' },
      timeout: TIMEOUT_MS,
    };
    if (body) options.headers['Content-Type'] = 'application/json';
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', (e) => resolve({ ok: false, status: 'ERR', err: e.code || e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 'TIMEOUT' }); });
    if (body) req.write(body);
    req.end();
  });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { sensores: [] };
  }
}

function saveState(state) {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Lógica pura (testeable sin red) ---

function vencido(sensor, now = Date.now()) {
  if (sensor.estado !== 'pendiente') return false;
  const inicio = new Date(`${sensor.aplicada}T00:00:00${TZ_OFFSET}`).getTime();
  return now >= inicio + sensor.ventanaDias * DAY_MS;
}

function ventana(sensor) {
  const desde = new Date(`${sensor.aplicada}T00:00:00${TZ_OFFSET}`).getTime();
  return { desde, hasta: desde + sensor.ventanaDias * DAY_MS };
}

function proponerScore(conteo, umbral) {
  // Métrica v1.3: sensor cumplido = 1.0, no cumplido = 0. El 0.5★ no sale de acá
  // (lo asigna R7 en sesión cuando anula una jugada por premisa falsa).
  return conteo <= umbral ? '1.0' : '0';
}

// --- Medición (agregá tu stack acá) ---

async function medir(sensor, env) {
  const { desde, hasta } = ventana(sensor);

  if (sensor.tipo === 'n8n-errores') {
    const url = env[`N8N_API_URL_${sensor.envPrefix}`];
    const key = env[`N8N_API_KEY_${sensor.envPrefix}`];
    if (!url || !key) return { error: `faltan N8N_API_URL_${sensor.envPrefix}/KEY en .env` };
    const r = await request({
      url: `${url}/api/v1/executions?status=error&workflowId=${sensor.wfId}&limit=250&includeData=false`,
      headers: { 'X-N8N-API-KEY': key },
    });
    if (!r.ok) return { error: `N8N no responde (${r.status})` };
    const enVentana = ((r.json && r.json.data) || []).filter((e) => {
      const t = new Date(e.stoppedAt || e.startedAt || 0).getTime();
      return t >= desde && t < hasta;
    });
    return { conteo: enVentana.length, detalle: `${enVentana.length} ejecuciones error de ${sensor.wfId}` };
  }

  if (sensor.tipo === 'nocodb-count') {
    const token = env[sensor.tokenEnv];
    if (!token) return { error: `falta ${sensor.tokenEnv} en .env` };
    const r = await request({ url: sensor.url, headers: { 'xc-token': token } });
    if (!r.ok) return { error: `NocoDB no responde (${r.status})` };
    const conteo = typeof r.json.count === 'number' ? r.json.count : null;
    if (conteo === null) return { error: 'respuesta NocoDB sin campo count' };
    return { conteo, detalle: `count=${conteo} · ${sensor.url.split('?')[0]}` };
  }

  return { error: `tipo de sensor desconocido: ${sensor.tipo}` };
}

// --- Self-test (assert-based, sin red) ---

function selfTest() {
  const assert = require('assert');
  assert.strictEqual(proponerScore(0, 0), '1.0', 'conteo 0 umbral 0 → 1.0');
  assert.strictEqual(proponerScore(3, 0), '0', 'conteo 3 umbral 0 → 0');
  assert.strictEqual(proponerScore(2, 2), '1.0', 'conteo == umbral → 1.0');
  const s = { estado: 'pendiente', aplicada: '2026-07-01', ventanaDias: 7 };
  const inicio = new Date(`2026-07-01T00:00:00${TZ_OFFSET}`).getTime();
  assert.strictEqual(vencido(s, inicio + 6 * DAY_MS), false, 'día 6 → no vencido');
  assert.strictEqual(vencido(s, inicio + 7 * DAY_MS), true, 'día 7 → vencido');
  assert.strictEqual(vencido({ ...s, estado: 'medido' }, inicio + 30 * DAY_MS), false, 'medido nunca re-vence');
  console.log('🟢 self-test OK (score + vencimiento)');
}

// --- Main ---

async function main() {
  if (process.argv.includes('--self-test')) return selfTest();

  const dryRun = process.argv.includes('--dry-run');
  const summary = process.argv.includes('--summary');
  const log = (...a) => console.log(...a);

  const state = loadState();

  if (summary) {
    if (state.sensores.length === 0) return log('(sin sensores registrados — el agente registra al aplicar jugadas medibles)');
    for (const s of state.sensores) {
      const res = s.resultado ? ` → conteo ${s.resultado.conteo}, propone ${s.resultado.scorePropuesto}` : '';
      log(`[${s.estado}] ${s.id} · vence a ${s.ventanaDias}d de ${s.aplicada}${res}`);
    }
    return;
  }

  const env = loadEnv();
  if (!env) { log('🔴 .env no encontrado'); process.exit(2); }
  const tgToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if ((!tgToken || !chatId) && !dryRun) { log('🔴 Faltan TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID'); process.exit(2); }

  const vencidos = state.sensores.filter((s) => vencido(s));
  if (vencidos.length === 0) {
    log('🟢 Sin sensores vencidos hoy.');
    process.exit(0);
  }

  const lines = [];
  for (const s of vencidos) {
    const m = await medir(s, env);
    if (m.error) {
      // No se pudo medir: queda pendiente, reintenta en la próxima corrida.
      lines.push(`⚠️ *${s.jugada}*: no se pudo medir — ${m.error}`);
      continue;
    }
    const score = proponerScore(m.conteo, s.umbral);
    s.estado = 'medido';
    s.resultado = {
      conteo: m.conteo,
      scorePropuesto: score,
      evidencia: m.detalle,
      ventana: `${s.aplicada} +${s.ventanaDias}d`,
      medidoEn: new Date().toISOString(),
    };
    const emoji = score === '1.0' ? '🟢' : '🔴';
    lines.push(`${emoji} *${s.jugada}*: conteo ${m.conteo} vs umbral ${s.umbral} → propone *${score}*\n   ${m.detalle}`);
  }

  const text = `📊 *Motor evolutivo — ${vencidos.length} sensor(es) vencido(s)*\n\n${lines.join('\n')}\n\n_Borrador: confirmá el score en la próxima sesión._`;

  if (dryRun) {
    log('--- DRY RUN (no se envía Telegram ni se persiste) ---');
    log(text);
    process.exit(0);
  }

  saveState(state);

  const tg = await request({
    url: `https://api.telegram.org/bot${tgToken}/sendMessage`,
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  if (!tg.ok) {
    log(`🔴 Sensores medidos pero falló el envío Telegram (${tg.status})`);
    process.exit(1);
  }
  log(`📨 ${vencidos.length} sensor(es) medidos y avisados.`);
  process.exit(0);
}

main().catch((e) => { console.error('🔴 Excepción:', e.message); process.exit(2); });
