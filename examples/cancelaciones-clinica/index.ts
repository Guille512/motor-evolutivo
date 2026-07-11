/**
 * cancelaciones-clinica — Vigía example
 *
 * Monitors a Google Sheets "Cancelaciones" tab and notifies the team
 * via WhatsApp when a new cancellation is detected. Then checks the
 * waiting list to offer the freed slot to the next patient.
 *
 * ⚠️  All data below is FICTIONAL — no real patient data is included.
 */

import { createVigia, VigiaConfig } from "../../src/vigia/vigia-skeleton";

// ── Configuration ──────────────────────────────────────────────
const config: VigiaConfig = {
  name: "cancelaciones-clinica",
  cron: "*/10 * * * *",
  enabled: true,
};

// ── Mock data (simulates what the real system would read) ──────
interface Cancelacion {
  fecha: string;
  hora: string;
  paciente: string; // fictional name
  motivo: string;
}

const mockCancelaciones: Cancelacion[] = [
  {
    fecha: "2026-07-11",
    hora: "15:00",
    paciente: "María González",
    motivo: "Viaje imprevisto",
  },
  {
    fecha: "2026-07-11",
    hora: "17:30",
    paciente: "Carlos Ruiz",
    motivo: "Enfermedad",
  },
];

interface PacienteEspera {
  nombre: string;
  telefono: string; // fictional
  preferencia: string;
}

const mockListaEspera: PacienteEspera[] = [
  { nombre: "Ana López", telefono: "+549351XXXXXXX", preferencia: "tarde" },
  { nombre: "Pedro Martín", telefono: "+549351YYYYYYY", preferencia: "mañana" },
];

// ── Core logic ─────────────────────────────────────────────────
async function checkCancelaciones(): Promise<Cancelacion[]> {
  // In production this reads from Google Sheets via API
  console.log("📋 Leyendo hoja de cancelaciones...");
  return mockCancelaciones;
}

async function notifyTeam(cancelacion: Cancelacion): Promise<void> {
  // In production this sends a WhatsApp message via Evolution API
  console.log(
    `📱 Notificando: Se canceló el turno de las ${cancelacion.hora} ` +
      `(${cancelacion.paciente} — ${cancelacion.motivo})`
  );
}

async function offerSlotToWaitingList(
  cancelacion: Cancelacion
): Promise<void> {
  const candidate = mockListaEspera.find(
    (p) =>
      (cancelacion.hora >= "14:00" && p.preferencia === "tarde") ||
      (cancelacion.hora < "14:00" && p.preferencia === "mañana")
  );

  if (candidate) {
    console.log(
      `🔔 Ofreciendo turno de las ${cancelacion.hora} a ${candidate.nombre} (${candidate.telefono})`
    );
  } else {
    console.log(
      `⏳ No hay pacientes en espera para el horario ${cancelacion.hora}`
    );
  }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const vigia = createVigia(config);

  // Simulate the vigía run cycle
  await vigia.run();

  const cancelaciones = await checkCancelaciones();

  if (cancelaciones.length === 0) {
    console.log("✅ Sin cancelaciones nuevas.");
    return;
  }

  console.log(`\n⚡ ${cancelaciones.length} cancelación(es) detectada(s):\n`);

  for (const c of cancelaciones) {
    await notifyTeam(c);
    await offerSlotToWaitingList(c);
    console.log("---");
  }

  console.log("\n✅ Ciclo de vigía completado.");
}

main().catch(console.error);
