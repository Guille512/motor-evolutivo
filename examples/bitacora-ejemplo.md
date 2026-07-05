# Bitácora de aprendizajes — {{proyecto}}

> Memoria del Motor Evolutivo. Append-only: lo obsoleto se marca, no se borra.
> **Métrica v1.3:** 1.0 = elegida tal cual · 0.5 = absorbida/reformulada ·
> 0.5★ = auto-corregida por R7 (señal POSITIVA) · 0 = ignorada/rechazada bien fundada.
> Toda entrada nombra la jugada más floja.

**Nota de transparencia:** las entradas 001-002 son **ilustrativas** (armadas
para mostrar el formato, no de una bitácora real). La entrada 003 es **real**,
tomada de una sesión de producción real y sanitizada (nombres de agentes,
cliente y datos de pacientes reemplazados por descripciones genéricas — nada
inventado en la mecánica ni en el score).

---

## Reglas consolidadas (el consolidador promueve acá los patrones 3+ veces repetidos)

- (todavía ninguna — se ganan, no se escriben de antemano)

---

## Entradas

### 001 — 2026-07-01 · apertura estándar (ilustrativa)

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

### 002 — 2026-07-04 · cierre de tramo (ilustrativa)

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

### 003 — 2026-06-26 · incorporación de un segundo agente colaborador (REAL, sanitizada)

**Jugadas propuestas:** (1) integrar un segundo agente de IA al flujo de trabajo —
rol de front-end/código, sin acceso a datos sensibles de clientes · (2) nombre
para el nuevo agente (consistente con la convención ya usada) · (3) 🧪 verificar
el contenido de una imagen antes de reusarla como asset de marketing (R7 verify-first).

**Reacción:** (1) y (2) elegidas tal cual — el segundo agente quedó operativo,
primera sesión completa entregada sin fricción. (3) **auto-activada por R7**: al
proponer reusar una captura de un dashboard interno como imagen de vista previa
para una landing pública, el agente principal verificó el contenido de la imagen
ANTES de copiarla al asset público. Resultado: la captura tenía nombres reales
de pacientes visibles. Se bloqueó el leak antes de publicar — el segundo agente
nunca llegó a ver el contenido de la imagen, solo el agente con R7 aplicado lo
detectó.

**Lección:** las imágenes son PII silenciosa. Regla nueva: antes de sugerir
CUALQUIER captura de pantalla existente (dashboard, panel interno) como asset de
marketing, leerla visualmente primero — nunca asumir que "es solo una interfaz".

**Jugada más floja:** (3) fue reactiva, no proactiva — la imagen se propuso como
opción antes de leer su contenido. R7 debería disparar en el momento en que
CUALQUIER asset existente se menciona como candidato, no después. El orden fue
el error, no el resultado final (se corrigió a tiempo).

**Efectividad: 2.5/3** (1.0 + 1.0 + 0.5★) — el 0.5★ es una captura de PII real
evitada antes de publicar, no una falla.

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
