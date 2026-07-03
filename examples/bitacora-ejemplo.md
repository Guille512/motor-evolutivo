# Bitácora de aprendizajes — {{proyecto}}

> Memoria del Motor Evolutivo. Append-only: lo obsoleto se marca, no se borra.
> **Métrica v1.3:** 1.0 = elegida tal cual · 0.5 = absorbida/reformulada ·
> 0.5★ = auto-corregida por R7 (señal POSITIVA) · 0 = ignorada/rechazada bien fundada.
> Toda entrada nombra la jugada más floja.

---

## Reglas consolidadas (el consolidador promueve acá los patrones 3+ veces repetidos)

- (todavía ninguna — se ganan, no se escriben de antemano)

---

## Entradas

### 001 — 2026-07-01 · apertura estándar

**Jugadas propuestas:** (1) arreglar el retry del job de emails que falla desde el
lunes [histórico: 3 errores en logs] · (2) extraer la config duplicada en 4 módulos
[creado] · (3) 🧪 probar el endpoint de batch que nadie usó [futuro].

**Reacción:** eligió (1) tal como se propuso — dolor concreto gana siempre.
(2) la reformuló: en vez de extraer config, borró 2 de los 4 módulos (mejor que lo
propuesto). (3) ignorada sin mirar.

**Lección:** cuando hay un error activo en logs, las jugadas de deuda técnica no
compiten — proponerlas igual pero esperar cero tracción hasta que el error muera.

**Jugada más floja:** (3) — curiosidad desconectada del dolor de la semana; una 🧪
mejor hubiera sido sobre el sistema de emails que ya estaba en foco.

**Efectividad: 1.5/3** (1.0 + 0.5 + 0)

### 002 — 2026-07-04 · cierre de tramo

**Jugadas propuestas:** (1) "reparar el cron de backups que está caído" · (2) agregar
alerta si la cola supera 100 mensajes · (3) 🧪 dashboard de una página con métricas.

**Reacción:** (1) ANULADA POR R7 antes de proponerse en firme: la verificación
read-only mostró que el cron corrió bien a las 03:00 (log adjunto) — la "caída" era
memoria vieja de la semana pasada. Se propuso (2) en su lugar → elegida tal cual.

**Lección:** todo estado recordado de más de 48h es sospechoso; verificar SIEMPRE
antes de proponer reparaciones (esto es exactamente para lo que existe R7).

**Jugada más floja:** (3) — tercera vez propuesta en variantes, cero interés las 3
veces. R1 la veta hasta que cambie el contexto.

**Efectividad: 1.5/2** (0.5★ + 1.0) — el 0.5★ es el motor cazando su propia jugada mala.

---

<!--
Formato mínimo de una entrada:

### NNN — fecha · contexto
**Jugadas propuestas:** ...
**Reacción:** ...
**Lección:** (1 línea accionable, generalizada — no sobreajustada al caso)
**Jugada más floja:** ... (obligatoria)
**Efectividad: X/Y**
-->
