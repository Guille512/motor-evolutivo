# Motor Evolutivo 🧬 — por [Guille Fernández](https://github.com/Guille512)

🇬🇧 **[Read in English](README.md)** · 🇪🇸 Estás leyendo la versión en español

[![License: MIT](https://img.shields.io/github/license/Guille512/motor-evolutivo?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Guille512/motor-evolutivo?style=flat-square)](https://github.com/Guille512/motor-evolutivo)
[![Protocol](https://img.shields.io/badge/protocol-markdown--only-blue?style=flat-square)]()
[![Made with Claude Code](https://img.shields.io/badge/made%20with-Claude%20Code-CC785C?style=flat-square)](https://claude.com/claude-code)

**Un prompt maestro que se mejora a sí mismo con evidencia real — sin reentrenar nada, sin infraestructura, sin datasets.**

![Demo del ciclo del Motor Evolutivo](docs/demo.png)

> 🖥️ **Funciona en cualquier terminal, con cualquier agente LLM.** El núcleo es
> markdown puro — no depende de Claude Code. Corre igual con Cursor, Windsurf,
> aider, Gemini CLI, Copilot Chat, o pegando el prompt directo en cualquier chat
> web. Claude Code es la ÚNICA parte opcional (una skill que automatiza el
> ciclo) — si no lo usás, el protocolo funciona exactamente igual a mano.

---

## ¿Qué es?

La mayoría de los frameworks de auto-mejora de prompts ([GEPA](https://github.com/gepa-ai/gepa), DSPy) son **librerías de código**: necesitás Python, datasets de evaluación y un pipeline de optimización.

El Motor Evolutivo es otra cosa: un **protocolo en markdown** que convierte a tu agente LLM en un sistema que aprende de sus propias sesiones de trabajo reales. Sin código obligatorio. Los principios son los mismos que GEPA (reflexión en lenguaje natural > reward numérico), pero el "dataset" son tus sesiones reales y el "optimizador" es un ciclo de reflexión supervisado.

```
  apertura de sesión                cierre de tramo
       │                                  │
       ▼                                  ▼
 radar-contexto ──► PROMPT MAESTRO ──► humano elige ──► reflexión-de-cierre
       ▲                  │                                    │
       │            filtro-novedad                      append a bitácora
       │                                                       │
       └──────────── consolidador ◄──── mutador-de-prompt ◄────┘
                    (cada ~5 usos)      (semanal, con OK humano)
```

**El resultado:** un agente que nunca te propone lo mismo dos veces, que verifica sus premisas antes de proponer, y cuyo prompt maestro es mejor esta semana que la anterior — con changelog versionado en git que lo prueba.

## Las 10 reglas (el corazón)

| Regla | Qué hace | De qué error real nació |
|-------|----------|------------------------|
| **R1 NOVEDAD** | Prohibido repetir lo ya hecho, rechazado o ignorado 2 veces | Jugadas recicladas sesión tras sesión |
| **R2 ORDEN** | Propuesta #1 = siempre el dolor más concreto (error en logs, no idea linda) | Propuestas "interesantes" que ignoraban lo que estaba roto |
| **R3 CURIOSIDAD** | Al menos 1 propuesta 🧪 en dirección no explorada | Convergencia prematura (principio Pareto de GEPA) |
| **R4 FUNDAMENTO** | Cada propuesta cita su fuente: histórico / presente / roadmap | Propuestas sin ancla verificable |
| **R5 SUPERVISIÓN** | Proponer, NUNCA ejecutar producción solo | Un incidente de producción real |
| **R6 REVALIDAR** | Al afirmar "X está roto/sano", pegar la evidencia (log, timestamp) EN la misma frase. **R6-b:** un control escrito en el mismo tramo —test, self-test, assert, monitor, guard, generador de evidencia— no es cobertura hasta habérselo visto dar ROJO ante el caso que debe cazar. **R6-c:** releer las mutaciones pendientes antes de proponer una nueva | 11+ afirmaciones sin verificar encontradas en bitácora · 4 instrumentos en 2 semanas que eran ellos mismos lo roto, los 4 con su propio test en verde |
| **R7 VERIFICAR-PRE** | Antes de proponer "reparar X", verificar que X esté roto de verdad. **R7-b:** antes de dictaminar la propuesta *de otro agente*, leer el código real que toca — y exigir la capacidad nueva antes que la prolijidad. **R7-c:** antes de escribir un handoff que instruye mecanismos concretos en una máquina ajena (git pull, script, servicio, deploy dir), verificar por efecto read-only que existen allá | Propuestas de arreglos fantasma sobre memoria desactualizada · veredictos escritos sobre un texto en vez de sobre el código |
| **R8 ROUTING DE EJECUCIÓN** | Cada jugada nombra su ejecutor más barato capaz; el agente que razona solo hace lo indelegable | Jugadas diferidas por falta de dueño + el agente caro haciendo trabajo barato |
| **R9 CONOCIMIENTO PROPIO** | Releer lo que vos mismo ya documentaste sobre una herramienta antes de usarla | 3 errores cuyo fix el agente ya tenía escrito y no consultó |
| **R10 FOLLOW-THROUGH DE DIFERIDAS** | Si hay diferidas, la jugada 1 es la más vieja retomada tal cual; si sobrevive dos tramos sin decisión, sale de la lista nombrada como bloqueada | Diferir lo incómodo SUBÍA la efectividad: la curva solo cuenta lo decidido, así que una jugada diferida desaparecía sin costo |

*(La instancia privada llama **R11** a esta regla: allá el nombre R10 quedó quemado cuando dos sesiones del mismo día propusieron la misma mutación sin verse, y el hueco se dejó a propósito para no invalidar las menciones viejas. Acá va numerada corrida — si arrancás de cero, no heredás la cicatriz ajena.)*

Ninguna regla salió de la teoría. **Todas son cicatrices**: cada una tiene la fecha y el error que la generó en el changelog.

## La métrica (v1.6 — anti-saturación, self-correction, diferidas, aceptación en bloque)

Cada cierre de tramo registra en la bitácora qué propuesta se eligió:

| Score | Significado |
|-------|-------------|
| **1.0** | Elegida **con descarte** — el humano eligió un subconjunto, lo reordenó, o pidió otra cosa: su respuesta trae información que el motor no tenía |
| **0.75** | **ACEPTACIÓN EN BLOQUE** — volvió el bloque entero sin descartar ninguna. Eso es un "dale", y un "dale" mide adherencia, no puntería |
| **0.5** | Absorbida / reformulada por el humano |
| **0.5★** | **AUTO-CORREGIDA**: R7 anuló la propuesta por premisa falsa ANTES de tocar prod. Señal POSITIVA — el motor cazó su propia mala jugada |
| **0** | Ignorada o rechazada estando bien fundada |
| **D** | **DIFERIDA** — propuesta, pero el humano no la decidió ni la ejecutó. **NO** entra en Y (contarla 0 castiga lo que no fue un rechazo; contarla 1.0 infla). Se lista aparte para que no pueda esconderse |

Tres protecciones que aprendimos a los golpes, cada una después de que la curva nos mintiera una vez:
- **Prohibido contar absorbidas como elegidas** — eso infló nuestra curva a un 93% falso y la dejó sin señal.
- **Un bloque pegado entero no es puntería** — cinco entradas seguidas dieron ~1.0 sin que las propuestas mejoraran. El humano simplemente había empezado a devolver el bloque completo como forma corta de decir "dale". El mismo fallo que el anterior, por otra puerta.
- **Toda entrada nombra la propuesta más floja** — una bitácora donde todo sale bien no enseña nada.

## Resultados reales (no benchmark — producción)

![Una reflexión-de-cierre real](docs/reflection-example.png)

> Una **reflexión-de-cierre real** — esta salió del mismo tramo que produjo esta
> actualización del README (25/07/2026). Sanitizada (sin nombres de clientes) y
> maquetada para que se lea; los scores, la jugada más floja nombrada y la
> auto-corrección son textuales de la bitácora. Fuente:
> [`docs/reflection-example.html`](docs/reflection-example.html).


Corriendo desde junio 2026 sobre 3 proyectos en producción (automatización N8N para clínicas + agencia):

- **24 mutaciones aprobadas** del prompt maestro (v1.0 → v3.5) en ~11 semanas, cada una fundada en ejecuciones reales — [historial completo fechado, sanitizado →](docs/CHANGELOG-HISTORY.md) (en inglés)
- **El motor se auto-detecta:** la curva de efectividad saturada al 93% disparó la redefinición de su propia métrica. R6 falló contra su propio autor → generó su versión operativa. La métrica castigaba al mejor mecanismo de seguridad → se corrigió sola en la siguiente ventana.
- **Curva de efectividad ~50%** post-corrección — y eso es lo sano: 100% significa que tu métrica está rota, no que tu agente es perfecto.
- **v2.0a — autonomía acotada:** las propuestas medibles declaran un `sensor:` (métrica + ventana + umbral) y un script 0-tokens las mide solo y propone el score con evidencia. Principio: **automatizar la EVIDENCIA, nunca la DECISIÓN.**
- **v2.1 — Dream Review:** la reflexión de cierre ahora también revisa la bitácora buscando la misma tarea *manual* repetida 3+ veces sin automatización propia — y sugiere el prompt exacto (pegable) para empaquetarla como skill. Solo sugerencia; el humano decide (R5 intacta).
- **v2.2 — estado diferida:** la métrica agrega un estado `D` (diferida) para propuestas que nadie decidió en el tramo — no cuenta como 0 ni como 1.0, se reporta aparte como `% diferidas`, para que un patrón de "proponer sin cerrar" no se esconda detrás de un score que se ve sano.
- **v2.3 — routing de ejecución (R8):** cada jugada propuesta debe nombrar su ejecutor más barato capaz (otro agente del roster, un script 0-tokens, un modelo barato) — el agente que razona solo ejecuta lo que nadie más puede. Jugada sin ejecutor = incompleta. Nació de señal real: jugadas diferidas por falta de dueño, y el agente caro ejecutando trabajo que uno barato podía hacer.
- **v2.4 — rebote de delegación:** la reflexión de cierre gana una línea obligatoria `Rebote: X/N` — cuántas entregas delegadas hubo que rebotar para corrección, sobre las verificadas en el tramo. La efectividad mide lo que el orquestador *propone*; el rebote mide lo que el ecosistema *entrega*. Nació de un análisis del ecosistema multi-agente: la curva llevaba 12-13 tramos clavada en 100% (olor a métrica rota) y el costo dominante era la coordinación, no la capacidad.
- **v2.5 — conocimiento propio (R9):** antes de invocar una herramienta, diseñar un artefacto o recomendarla en una jugada, el agente debe releer los hallazgos que *él mismo ya escribió* (memoria, doc de la pieza, bitácora) y aplicarlos desde el primer intento. Distinta de R6 (leer el componente real) y R7 (verificar el estado del sistema): R9 apunta a conocimiento que ya existe escrito y simplemente no se consultó. Nació de 3 ocurrencias reales en 2 tramos del mismo patrón exacto — el agente tenía con qué prevenir el error, lo cazó recién en auto-corrección posterior, y pagó ciclos evitables.
- **v2.8 — el motor aprendió a auditar en vez de opinar:** tenía regla para verificar sus *propias*
  premisas antes de proponer, y ninguna para el caso que se había vuelto frecuente sin que nadie
  lo notara: *evaluar lo que propone otro agente*. R7-b ahora obliga a leer el código real que la
  propuesta toca antes de dictaminar. Lo que hizo la regla: en el veredicto que la disparó, el 80%
  del valor entregado no fue el fallo sobre las cinco propuestas — fue un bug que ninguna
  mencionaba (tres rutas de API cayendo en silencio a los datos de un inquilino cuando faltaba un
  query param, devolviendo 200 igual). Vinieron con ella dos filtros: **exigir la capacidad nueva
  antes que la prolijidad** — si "¿qué se puede hacer después que no se podía antes?" se responde
  "nada, queda más limpio", el refactor es deuda con otro nombre — y toda propuesta de *mover esta
  config a la base de datos* debe declarar qué parte de eso no es dato (las clases de un framework
  CSS con purga estática no sobreviven a una tabla; un componente no es serializable).
- **v3.5 - un contrato que nombra terreno que nadie verifico:** antes de escribir un handoff o ticket que instruye mecanismos concretos en una maquina ajena (correr un git pull, ejecutar un script, reiniciar un servicio, tocar un directorio de deploy), verificar por efecto read-only que ese mecanismo existe alla - la ruta existe, es un repo git, el script hace lo que el contrato dice. Cuarta ocurrencia del patron en cinco semanas: un directorio de deploy que no era repo git, un env de produccion pisado en pleno redeploy, IDs de credencial inventados en un JSON de handoff, y un respaldo automatico apuntado a la carpeta de docs durante meses. Sin esa verificacion el handoff es prosa; con ella, es procedimiento. El contrato nombra el terreno; el terreno decide si el contrato es ejecutable.
- **v3.4 - el bloque de sugerencias de herramienta era una regla escapandose a su propia seccion:** el agente cerraba cada respuesta con un segundo bloque recomendando comandos y features del entorno donde corre. Ese bloque venia del archivo de configuracion del agente, no del motor - y al vivir afuera perdia los tres filtros que hacen serio a todo lo demas: novedad (repetia comandos entre tramos), verificacion de premisa (llego a proponer cirugia de historia sobre un commit que **ya estaba pusheado**, premisa falsa que nadie chequeo) y sobre todo la metrica: nunca entraba en Y, asi que proponer mal ahi **no costaba nada**. Son las sugerencias mas frecuentes de todas, y eran las unicas gratis. La senal de que la frontera ya se habia disuelto en la practica: dos veces en un mismo dia el humano pego de vuelta el bloque de *herramientas*, no el del motor, y se ejecuto como jugadas del motor sin que nadie notara el cruce. v3.4 las unifica: una jugada cuyo ejecutor es un comando del entorno va en "proximas jugadas" con su tag de ejecutor, y puntua como cualquier otra. **R9-b queda derogada** por innecesaria - existia solo porque el bloque de cierre se redactaba fuera del filtro de evidencia, cosa que su propio texto admitia; con un solo bloque hay un solo filtro. Lo sustantivo suyo (contrastar una tarea recurrente contra los jobs ya instalados) sobrevive dentro de R8. Costo aceptado: la curva va a BAJAR, porque empiezan a contar las jugadas mas frecuentes. Ese es el punto - v3.1 y v3.2 atacaron la saturacion en *como* se puntua; esta ataca lo que directamente no se contaba.
- **v3.3 - dos reglas duras reclamaban el mismo lugar, agregadas el mismo dia sin verse:** R2 decia "la jugada 1 es SIEMPRE el dolor mas concreto"; R11, salida horas antes, decia "la jugada 1 es la diferida mas vieja". Las dos vivas, las dos apuntando al slot 1, asi que el empate lo resolvia el criterio del agente - exactamente lo que las reglas existen para evitar. Se arreglo por alcance, no con una regla nueva: R2 pasa a regir la primera jugada **nueva**; R11 toma el slot 1 **solo si hay diferidas**, y si no hay, no toma nada. Alternativas descartadas: subir el tope a 4 jugadas (infla el bloque, que es el problema que v3.1 y v3.2 vinieron a atacar) y listar la diferida aparte (la saca del orden de prioridad, o sea la vuelve opcional otra vez - justo el modo de falla que origino R11).
- **v3.2 - una diferida que nadie retoma no se queda quieta, bloquea trabajo futuro (R11):** nada obligaba a que una diferida volviera. Desaparecia sin costo, y **la curva de efectividad no la penalizaba** - Y solo cuenta lo decidido, asi que diferir lo incomodo SUBIA la tasa. Saturacion encubierta, y la senal `% diferidas` existia para detectarla pero no tenia ningun mecanismo detras. Disparada por senal, no por cadencia: `% diferidas` sobre el umbral del 30% **tres tramos consecutivos** (33% - 33% - 36%). El caso testigo: restaurar una credencial OAuth vencida del calendario de un cliente, propuesta un dia, nunca decidida, silenciosamente ausente de los dos tramos siguientes - y tres dias despues fue exactamente lo que impidio cerrar la prueba de disparo de un workflow. R11: si hay diferidas, la jugada 1 es la mas vieja retomada tal cual (max 1, el tope no sube); una que sobreviva dos tramos sin decision sale de la lista y se nombra **bloqueada, con su bloqueante** - una diferida que reaparece para siempre es ruido, no follow-through.
- **v3.1 — la métrica dejó de discriminar, así que cambió la métrica:** cinco entradas seguidas de la bitácora dieron ~1.0 (1.0 · 0.92 · 1.0 · 1.0 · 0.96) sin que las jugadas mejoraran. La razón era mundana: el humano había empezado a pegar el bloque entero de "próximas jugadas" de vuelta como forma corta de decir "dale", y la métrica leía eso como "elegida tal cual = 1.0" para todas, siempre. Es **el mismo fallo que v1.2 ya había arreglado una vez, volviendo por otra puerta** — v1.2 mató la saturación por jugadas *absorbidas*; esta era saturación por *aceptación en bloque*. Métrica v1.6: una jugada aceptada como parte de un bloque entero, sin descartar ninguna, vale **0.75**; el 1.0 completo exige que el humano haya elegido un subconjunto, lo haya reordenado, o pedido otra cosa — una respuesta que traiga información que el motor no tenía. No mide la confianza del humano, mide la capacidad del motor de **discriminar entre sus propias jugadas**: un tramo entero en 0.75 dice honestamente "pasaron todas, no se destacó ninguna". Confirmado en vivo dos veces — el mensaje que aprobó esta mutación era él mismo un bloque de tres jugadas pegado entero, con la mutación adentro.
- **v3.0 — un control no es cobertura hasta habérselo visto fallar (R6-b):** cuatro veces en dos semanas lo roto era el *instrumento*, y las cuatro tenían su propio test en verde: tests async que nunca esperaban sus promesas; una alarma que el agente había armado él mismo el día anterior; un self-assert que medía aritmética en vez del camino que decía probar; y —el que forzó la regla— el **generador de recibos**, la pieza cuyo trabajo entero es que el PASS lo derive el tooling y no la prosa del agente. Una llamada al shell re-juntaba los argumentos sin volver a citarlos, así que cualquier patrón entre comillas se partía: un control negativo que debía fallar devolvía exit 0. Le había puesto firma de máquina a una afirmación falsa, y nunca había tenido self-test. R6-b: un control escrito en el mismo tramo no es cobertura hasta haber roto a propósito lo que protege y pegado el rojo. **Deliberadamente no es una décima regla** — mismo razonamiento que R9-b: R6 ya cubría la evidencia, solo faltaba su alcance. Sale junto con **R6-c** (releer las mutaciones pendientes antes de proponer una nueva), que existe porque *esta misma mutación fue propuesta dos veces el mismo día por dos sesiones que no podían verse* — una mutación duplicada infla la misma señal de "patrón repetido" que usa para justificarse.
- **v2.9 — el bloque de cierre también cuenta (R9-b):** R9 ya exigía releer lo que el agente había documentado antes de actuar — pero solo se aplicaba al cuerpo de la respuesta. Las dos o tres recomendaciones de herramientas que se agregan al final de cada respuesta se redactaban al último, fuera de ese filtro. El mismo antipatrón tres veces: recomendar una vigilancia recurrente para algo que ya cubría un job programado instalado (autorretractada al ejecutarla; consolidada en memoria once días después; y propuesta de nuevo — esta vez *elegida por el usuario* antes de retractarse). R9-b extiende el alcance: toda tarea recurrente o monitor nuevo que se recomiende se contrasta contra los jobs que ya corren antes de ofrecerlo; si ya está cubierto, se propone el hueco que queda o nada. **Deliberadamente no es una décima regla** — R9 ya cubría el caso, solo faltaba su alcance, y una regla nueva la habría duplicado dejando el efecto sin atribuir. Se mutó una sola cosa: dónde aplica R9.
- **v2.6 / v2.7 — el motor se puntúa solo desde datos reales:** un colector 0-tokens deriva 2 de las 5 dimensiones del baseline de agentes desde evidencia en vez de juicio. **Autonomía** ← frescura del heartbeat de cada agente-loop. **Integración** ← tasa de cierre de los tickets dirigidos a ese agente en el canal compartido, penalizada por la antigüedad del más viejo abierto — con **`N/A` explícito por debajo de 3 tickets** (dato insuficiente es un estado válido, no un 0 ni un promedio falso). Mismo principio que v2.0a: **automatizar la EVIDENCIA, nunca la DECISIÓN.** Un hallazgo en el camino (R7 en acción): los archivos que *parecían* heartbeats eran en realidad el estado anti-duplicado de las propias vigías — los latidos reales vivían en otro lado, y ahí se apuntó el colector.

El trabajo de cliente detrás de estos números tiene NDA, así que la bitácora privada completa no se puede publicar — pero [`examples/bitacora-ejemplo.md`](examples/bitacora-ejemplo.md#003) incluye una **entrada real, sanitizada** (detalles identificatorios reemplazados, mecánica y score intactos): un chequeo R7 verify-first que evitó que datos reales de un cliente se filtraran a un asset público, con score 0.5★ (auto-corrección, no una falla).

## Quickstart (5 minutos, cualquier terminal)

Ningún paso de acá abajo requiere Claude Code — son archivos de texto que pegás
en la conversación con tu agente, sea cual sea la terminal o el chat que uses.

1. **Copiá** [`prompts/motor-evolutivo-template.md`](prompts/motor-evolutivo-template.md) a tu repo y completá los `{{placeholders}}` (nombre del agente, proyecto, dónde vive tu roadmap).
2. **Creá la bitácora** — un archivo `learnings/aprendizajes.md` con el header del template (o copiá [`examples/bitacora-ejemplo.md`](examples/bitacora-ejemplo.md)).
3. **Al abrir sesión de trabajo:** pegale el prompt maestro a tu agente (Claude Code, Cursor, aider, ChatGPT, el que uses) → te da máx. 3 propuestas con las reglas R1-R10 aplicadas.
4. **Al cerrar el tramo:** pegale el sub-prompt `reflexión-de-cierre` (≤5 líneas) → append a la bitácora con `Efectividad: X/Y`.
5. **Una vez por semana:** el mutador propone UNA mejora al prompt maestro basada en las últimas 5 reflexiones. La aprobás → changelog. La rechazás → eso también es señal y va a la bitácora.

**Opcional — solo si usás Claude Code:**
- Instalá [`skill/SKILL.md`](skill/SKILL.md) en `~/.claude/skills/motor-evolutivo/` — el ciclo completo (pasos 3-5) se opera diciendo "motor", sin copiar/pegar nada a mano.
- **Sensores 0-token:** [`scripts/watch-sensores.js`](scripts/watch-sensores.js) es Node.js puro — corre en cualquier terminal (no solo Claude Code) por cron/Task Scheduler, mide el resultado de las propuestas aplicadas (vía API de tu stack) y avisa por Telegram, sin gastar tokens de ningún LLM.

## Estructura del repo

```
├── prompts/motor-evolutivo-template.md   ← EL prompt maestro (plantilla genérica)
├── skill/SKILL.md                        ← operador del ciclo para Claude Code
├── scripts/watch-sensores.js             ← score-collector 0-token (opcional)
├── examples/bitacora-ejemplo.md          ← bitácora con entradas de ejemplo
└── docs/arquitectura-autonomia.md        ← el plan v2.0 completo (qué automatizar y qué NO)
```

## Cuándo NO usarlo

- Si querés optimización automática masiva contra un dataset → usá [GEPA](https://github.com/gepa-ai/gepa) directo, es para eso.
- Si nadie va a hacer la reflexión de cierre → sin ese paso el motor NO evoluciona; es un prompt estático con otro nombre.
- Si querés que el agente ejecute producción sin supervisión → este protocolo es explícitamente lo contrario (R5). La señal de aprendizaje ES la decisión humana; sacala y el motor se puntúa solo (ya vimos cómo termina: curva inflada sin información).

## Fundamento

| Principio | Fuente |
|-----------|--------|
| La reflexión en lenguaje natural supera al reward numérico | [GEPA — "Reflective Prompt Evolution Can Outperform Reinforcement Learning" (arXiv 2507.19457)](https://arxiv.org/abs/2507.19457) |
| Try → Reflect → Consolidate sin reentrenar | ACE (Agentic Context Engineering) |
| Árbol de candidatos, no convergencia prematura | GEPA (selección Pareto) |
| El prompt como proceso revisable, versionado en git | Survey de memoria de agentes 2026 |

## Atribución

Si este protocolo (las reglas R1-R10, la métrica v1.6, o el patrón de sensores
de autonomía acotada) aparece en tu propio artículo, charla o producto, un
link de vuelta acá se agradece — es lo único que mantiene la conexión con
el origen:

> Motor Evolutivo — Guillermo Fernández, 2026. https://github.com/Guille512/motor-evolutivo

## Privacidad y seguridad

Sin telemetría, sin cuenta, sin API key para el protocolo core — es markdown
que pegás en tu propio agente. El único script opcional solo llama a las
APIs que VOS configurás, nunca manda datos a ningún lado. Política completa
(en inglés): [SECURITY.md](SECURITY.md).

## Licencia

MIT — [Guillermo Fernández](https://github.com/Guille512). Si lo usás y el motor te enseña algo, contá la cicatriz en un issue: las reglas de otros son el mejor changelog.
