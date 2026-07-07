---
name: motor-evolutivo
description: >
  Opera el ciclo de vida del Motor Evolutivo — el sistema de prompts dinámico y
  autogestionable (prompts/motor-evolutivo.md). Usar SIEMPRE que: (1) se cierre un
  tramo de trabajo donde hubo "▶ Próximas jugadas" propuestas (para correr la
  reflexión-de-cierre y registrar Efectividad X/Y); (2) el usuario diga "motor",
  "jugadas", "reflexión", "efectividad", "mutá el prompt", "consolidá aprendizajes",
  "¿el sistema está mejorando?"; (3) pase ~1 semana sin mutación del prompt maestro
  (proponer una); (4) la bitácora acumule ~5 entradas sin consolidar.
---

# Motor Evolutivo — operador del ciclo de auto-mejora

## Para qué existe

El prompt maestro propone jugadas en cada apertura. Lo que necesita un operador
confiable es el **resto del ciclo**: la reflexión al cerrar, la consolidación de
patrones, la mutación semanal y la métrica de si de verdad mejora. **Esta skill es
ese operador.** Sin ella, el motor propone pero no aprende — y un motor que no
aprende es un prompt estático con otro nombre.

## Fuentes de verdad (leer/escribir AHÍ, no duplicar acá)

```
<repo>/prompts/motor-evolutivo.md    ← prompt maestro + reglas R1-R7 + changelog
<repo>/learnings/aprendizajes.md     ← bitácora (reglas consolidadas + entradas
                                        con Efectividad: X/Y)
<repo>/scripts/.state/sensores.json  ← sensores de jugadas medibles (opcional)
```

Regla dura: esta skill **no tiene archivos de datos propios**. Si algún día los
necesita, algo se está duplicando — frenar y repensar.

## Operaciones

### 1. Reflexión-de-cierre (la más frecuente — correrla SIN que la pidan)

**Cuándo:** al cerrar un tramo donde se propusieron jugadas y el usuario reaccionó.

**Cómo:** responder en ≤5 líneas y hacer append en la bitácora:
0. **Sensores primero (si usás el score-collector):** leer `sensores.json` — si hay
   sensores `estado: medido`, su `scorePropuesto` + evidencia van directo a la
   entrada (NO re-medir a mano). El usuario confirma en 1 línea; tras el append,
   borrar esos sensores del JSON. Inversa: al APLICAR una jugada medible nueva,
   registrar su sensor (formato en el header de `scripts/watch-sensores.js`).
1. ¿Qué jugada eligió? ¿Por qué ESA? (tipo de jugada, no el caso puntual)
2. ¿Qué rechazó o ignoró y qué enseña eso?
3. ¿Hay una regla nueva que merezca la bitácora? (1 línea accionable, generalizada)
4. Cerrar con `Efectividad: X/Y` — métrica v1.4: elegida tal cual = **1.0** ·
   absorbida/reformulada = **0.5** · anulada por R7 sobre premisa falsa = **0.5★**
   (señal POSITIVA) · ignorada/rechazada estando bien fundada = **0** · **`D`
   (diferida)** = propuesta pero el humano no decidió ni ejecutó en el tramo — NO entra
   en Y (no es 0 ni 1.0), se lista aparte.
   PROHIBIDO contar absorbidas como elegidas.
5. Nombrar SIEMPRE la **jugada más floja** de la tanda y por qué — toda entrada
   carga al menos una señal negativa.
5b. **Listar `Diferidas:`** — las jugadas `D`, 1 línea c/u con razón, o `—` si ninguna.

### 2. Consolidación (cada ~5 entradas nuevas)

Detectar patrones repetidos 3+ veces — siempre aprobados o siempre rechazados — y
**promoverlos** a "Reglas consolidadas" en la bitácora. Generalizar la lección,
nunca sobreajustar al caso. La bitácora es append-only: lo obsoleto se marca
`⚠️ superado por...`, no se borra.

### 3. Mutación del prompt maestro (semanal, SIEMPRE con OK del usuario)

1. Leer las últimas ~5 reflexiones + el prompt maestro actual.
2. Proponer **UNA sola mutación**, fundamentada en qué falló o qué patrón emergió.
3. Mostrar el diff en lenguaje llano. El usuario aprueba → aplicar + changelog.
4. Si la rechaza, registrar el porqué en la bitácora (también es señal).

### 4. Curva de efectividad ("¿el sistema aprende?")

Extraer la serie X/Y por fecha y mostrarla (tasa por entrada + tendencia).
Veredicto honesto en 1 línea: **sube / plana / baja**. Plana o baja 3 mediciones
seguidas → disparar una mutación apuntada al patrón ignorado. Medir sin actuar
es decorativo.

**Señal complementaria `% diferidas` (v1.4):** junto a la efectividad, reportar
`% diferidas = D / (Y + D)` (D = jugadas del trano marcadas `D`, que no entraron en Y).
Si `% diferidas > 30%` en 3 tramos seguidos → dispara mutación apuntada al patrón
**"proponer sin follow-through"** (saturación encubierta: el motor infla la curva
difiriendo lo incómodo). Atrapa lo que la efectividad sola no ve — una curva al 100%
puede estar escondiendo jugadas que se proponen pero nunca se ejecutan ni se rechazan.

### 5. Auditoría de novedad (a demanda)

Si el usuario dice "esto ya me lo propusiste": contrastar las últimas jugadas
contra la bitácora. Veredicto por jugada: NUEVA / REPETIDA / REFORMULADA.
Repetidas = fallo de R1 → candidata directa a mutación.

## Instalación (Claude Code)

```
cp -r skill/ ~/.claude/skills/motor-evolutivo/
```

Después, en cualquier sesión: decí **"motor"** y la skill opera el ciclo.
