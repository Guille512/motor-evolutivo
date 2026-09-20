#!/usr/bin/env node
// check-instancia.js — ¿esta instancia del motor está sana?
//
//   node scripts/check-instancia.js <ruta/a/prompts/motor-evolutivo.md> [--template <ruta>] [--skill <ruta/SKILL.md>]
//   node scripts/check-instancia.js --self-test
//
// Exit 0 = sana. Exit 1 = rota (lista qué). Sin dependencias.
//
// Por qué existe: la nota de versión de la plantilla dijo "incluye hasta v3.0"
// durante 8 versiones (el cuerpo iba por v3.8) y nadie lo vio; la skill operadora
// del original quedó 3 mutaciones atrás en silencio. Una instancia que nadie
// verifica se desactualiza igual. Esto es lo mínimo que un cron o un agente
// puede correr antes de confiar en su propio motor.
//
// Qué chequea (cada uno cazó un fallo real o su análogo):
//   1. 0 placeholders {{...}} sin completar (una instancia con {{norte}} literal "funciona")
//   2. línea `plantilla: vX.Y (<hash>)` en la cabecera — sin eso no se puede saber
//      qué mecanismo corre; con --template, compara contra la versión real de la plantilla
//   3. la bitácora referenciada existe y no está vacía
//   4. la nota "incluye hasta vX.Y" (si quedó) coincide con la última versión del changelog
//   5. línea `serie: PREFIJO-NNN` y la bitácora solo tiene entradas de ESA serie — dos
//      agentes en el mismo home (Simba + Hermes en la Beelink) se detectan por la
//      cicatriz, no por confiar en que cada uno lea su carpeta (hallazgos 1 y 7 de Momo)
//   6. con --skill <ruta>: la skill operadora nombra la ruta de ESTA instancia — el guard
//      certifica lo que el agente ejecuta, no solo el archivo (hallazgo 2 de Momo = #315)
'use strict';
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = /\{\{[^}]+\}\}/g;
const PLANTILLA = /^plantilla:\s*v(\d+\.\d+)\s*(?:\(([0-9a-f]{7,40})\))?/m;
const SERIE = /^serie:\s*([A-Z][A-Z0-9]*)-NNN/m;
const ENTRADA_SERIE = /^(?:#+\s*|- \*\*|\*\*)?([A-Z][A-Z0-9]*)-\d{3}\b/gm;
const VERSION_CHANGELOG = /^- \*\*v(\d+\.\d+)/gm;
const NOTA_INCLUYE = /incluye hasta la mutación \*\*v(\d+\.\d+)/;
const BITACORA_REF = /bitácora[^\n]*?`([^`]+\.md)`/i;

function ultimaVersion(texto) {
  let max = null;
  for (const m of texto.matchAll(VERSION_CHANGELOG)) {
    const v = m[1].split('.').map(Number);
    if (!max || v[0] > max[0] || (v[0] === max[0] && v[1] > max[1])) max = v;
  }
  return max ? max.join('.') : null;
}

function check(rutaInstancia, opts = {}) {
  const fallas = [];
  if (!fs.existsSync(rutaInstancia)) return [`no existe: ${rutaInstancia}`];
  const texto = fs.readFileSync(rutaInstancia, 'utf8');

  const ph = [...new Set(texto.match(PLACEHOLDER) || [])];
  if (ph.length) fallas.push(`placeholders sin completar: ${ph.join(' ')}`);

  const pl = texto.match(PLANTILLA);
  if (!pl) fallas.push('falta la línea `plantilla: vX.Y (hash)` en la cabecera');
  else if (opts.template) {
    // la versión de la plantilla es SU cabecera `plantilla:` (su changelog es la semilla v1.0 de la instancia)
    const tt = fs.existsSync(opts.template) ? fs.readFileSync(opts.template, 'utf8') : '';
    const tv = (tt.match(PLANTILLA) || [])[1] || ultimaVersion(tt);
    if (tv && tv !== pl[1]) fallas.push(`mecanismo viejo: instancia declara plantilla v${pl[1]}, la plantilla actual es v${tv}`);
  }

  const serie = texto.match(SERIE);
  if (!serie) fallas.push('falta la línea `serie: PREFIJO-NNN` en la cabecera');

  const bit = texto.match(BITACORA_REF);
  if (bit) {
    const rb = path.isAbsolute(bit[1]) ? bit[1] : path.resolve(path.dirname(rutaInstancia), '..', bit[1]);
    if (!fs.existsSync(rb)) fallas.push(`bitácora referenciada no existe: ${rb}`);
    else {
      const tb = fs.readFileSync(rb, 'utf8');
      if (!tb.trim()) fallas.push(`bitácora vacía: ${rb}`);
      else if (serie) {
        const ajenas = [...new Set([...tb.matchAll(ENTRADA_SERIE)].map(m => m[1]).filter(s => s !== serie[1]))];
        if (ajenas.length) fallas.push(`la bitácora tiene entradas de otra serie (${ajenas.join(', ')}) — otro agente escribió acá o se copió contenido ajeno`);
      }
    }
  }

  if (opts.skill) {
    if (!fs.existsSync(opts.skill)) fallas.push(`skill no existe: ${opts.skill}`);
    else {
      const ts = fs.readFileSync(opts.skill, 'utf8').split('\\').join('/');
      const abs = path.resolve(rutaInstancia).split('\\').join('/');
      if (!ts.includes(abs)) fallas.push(`la skill ${opts.skill} no nombra esta instancia (${abs}) — el agente ejecuta otra cosa que la que el guard mira`);
    }
  }

  const nota = texto.match(NOTA_INCLUYE);
  const ult = ultimaVersion(texto);
  if (nota && ult && nota[1] !== ult) fallas.push(`la nota dice "incluye hasta v${nota[1]}" pero el changelog llega a v${ult} (defecto del encabezado que miente)`);

  return fallas;
}

function selfTest() {
  const os = require('os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-instancia-'));
  const w = (n, s) => { const p = path.join(dir, n); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); return p; };
  const sana = '# Motor\nplantilla: v3.11 (88cb14c)\nserie: SIMBA-NNN\nLa bitácora (`learnings/aprendizajes.md`) es la memoria.\n## Changelog\n- **v1.0 — 2026-09-20:** inicio\n- **v1.1 — 2026-09-21:** x\n';
  w('learnings/aprendizajes.md', '## SIMBA-001 …\n');
  w('learnings/mixta.md', '## SIMBA-001 …\n## HERMES-001 …\n');
  // la plantilla real: cabecera v3.11 y changelog-semilla v1.0 — el guard debe leer la cabecera
  const tpl = w('tpl.md', 'plantilla: v3.11 (88cb14c)\n## Changelog\n- **v1.0 — semilla**\n');
  const a = w('prompts/a.md', sana);
  const skillOk = w('skills/ok/SKILL.md', `opera ${a.split('\\').join('/')}`);
  const skillAjena = w('skills/ajena/SKILL.md', 'opera /home/otro/motor-simba/prompts/motor-evolutivo.md');
  const casos = [
    ['sana', a, 0],
    ['placeholder suelto', w('prompts/b.md', sana.replace('# Motor', '# Motor {{norte}}')), 1],
    ['sin línea plantilla', w('prompts/c.md', sana.replace(/^plantilla:.*\n/m, '')), 1],
    ['bitácora inexistente', w('prompts/d.md', sana.replace('learnings/aprendizajes.md', 'learnings/nope.md')), 1],
    ['nota incluye-hasta desactualizada', w('prompts/e.md', sana + '> Nota: incluye hasta la mutación **v1.0**\n'), 1],
    ['mecanismo viejo vs template', w('prompts/f.md', sana.replace('v3.11', 'v3.0')), 1, tpl],
    // eje ortogonal: orden del changelog invertido y versión de dos dígitos — el "máximo" no es la última línea
    ['changelog desordenado + v1.10', w('prompts/g.md', sana.replace('- **v1.1 — 2026-09-21:** x', '- **v1.10 — z:** w\n- **v1.2 — y:** v') + '> Nota: incluye hasta la mutación **v1.10**\n'), 0],
    ['placeholder con default {{max|3}}', w('prompts/h.md', sana.replace('# Motor', '# Motor {{max_jugadas|3}}')), 1],
    ['sin línea serie', w('prompts/i.md', sana.replace(/^serie:.*\n/m, '')), 1],
    ['bitácora con entradas de otra serie (Hermes escribió en motor-simba)', w('prompts/j.md', sana.replace('learnings/aprendizajes.md', 'learnings/mixta.md')), 1],
    ['skill que nombra esta instancia', a, 0, null, skillOk],
    ['skill que apunta a otra instancia', a, 1, null, skillAjena],
    // eje ortogonal: la mención inocua "tu serie es HERMES-NNN" en prosa NO dispara (Momo 7)
    ['prosa que menciona a la otra serie sin escribir entradas', w('prompts/l.md', sana + '\nSi sos Hermes, tu serie es HERMES-NNN, no esta.\n'), 0],
  ];
  let ok = 0;
  for (const [nombre, ruta, esperado, template, skill] of casos) {
    const f = check(ruta, { template, skill });
    const pass = (f.length ? 1 : 0) === esperado;
    ok += pass;
    console.log(`${pass ? '✓' : '✗'} ${nombre}${pass ? '' : ' → ' + (f.join(' | ') || 'sin fallas')}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`self-test ${ok}/${casos.length}`);
  process.exit(ok === casos.length ? 0 : 1);
}

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.includes('--self-test')) selfTest();
  else {
    const flag = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
    const template = flag('--template'), skill = flag('--skill');
    const ruta = a.filter((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--'))[0];
    if (!ruta) { console.error('uso: check-instancia.js <ruta/prompts/motor-evolutivo.md> [--template <ruta>] [--skill <ruta/SKILL.md>] | --self-test'); process.exit(2); }
    const f = check(ruta, { template, skill });
    if (!f.length) { console.log(`✓ instancia sana: ${ruta}`); process.exit(0); }
    console.log(`✗ instancia rota: ${ruta}`); f.forEach(x => console.log('  - ' + x)); process.exit(1);
  }
}
module.exports = { check };
