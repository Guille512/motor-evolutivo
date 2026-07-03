# Autonomía acotada (v2.0) — qué automatizar y qué NO

> El principio rector, ganado a los golpes: **automatizar la EVIDENCIA, nunca la
> DECISIÓN.** El motor se vuelve autónomo en observar, medir y redactar borradores.
> El humano sigue siendo el único gate de producción — y no como limitación: la
> reacción humana ES el ground truth de la métrica. Sacala del loop y el motor se
> puntúa solo (ya lo vimos: curva inflada al 93% falso, cero señal).

## Qué SÍ automatizar (todo 0-tokens, scripts + cron)

### 1. Score-collector (`scripts/watch-sensores.js`) — implementado
Las jugadas MEDIBLES declaran un sensor al proponerse:
`sensor: <métrica> · <ventana>d · umbral <n>`.
Al aplicarse, el agente registra el sensor en un JSON. Un script por cron mide al
vencer la ventana (API directas del stack, sin LLM), propone el score con la
evidencia pegada y avisa por Telegram. El humano confirma con una palabra.

Regla dura: las jugadas estratégicas sin sensor honesto quedan manuales.
**Prohibido inventar métrica proxy** — re-crea el problema de la curva sin señal.

### 2. Reflexión-borrador
Al cerrar sesión, el agente redacta la entrada de bitácora completa (jugadas,
evidencia, score propuesto de los sensores) marcada `(borrador — confirmar)`.
Un borrador NUNCA cuenta para la curva hasta ser confirmado.

### 3. Detección continua de mutaciones
El consolidador no espera la ventana semanal para DETECTAR un patrón 3x — puede
avisar (diff + evidencia, por Telegram) en cualquier momento. La APLICACIÓN sigue
esperando el OK humano. Rollback = git revert (el prompt maestro vive en git).
Límite: UNA mutación por vez, para atribuir efectos.

### 4. Vencimiento temporal de R1
Un rechazo deja de ser veto eterno: se registra con su motivo-condición
("sin presupuesto", "prefiere X"). Vence cuando la condición cambia de forma
verificable, o a los 90 días — y la jugada solo vuelve reformulada citando qué cambió.

## Qué NO automatizar (y por qué, con la cicatriz)

| Tentación | Por qué NO |
|-----------|------------|
| **Aplicar mutaciones sin OK humano** | La métrica usa la reacción humana como ground truth. Auto-aplicar = el motor puntuándose solo = curva sin información. Además: una regla de supervisión (R5) que nació de un incidente de producción real no se negocia por elegancia arquitectónica. |
| **Puntuar jugadas estratégicas con métricas proxy** | "Engagement del usuario con la propuesta" y similares inflan la curva exactamente como contar absorbidas como elegidas. Si no hay conteo honesto, es manual. |
| **Sandbox con réplica del entorno productivo** | Costo de infra + datos sensibles en la réplica + mantenimiento de la réplica. El sustituto que ya demostró funcionar: **gate de corridas supervisadas** — la mutación entra marcada "en prueba", corre 3 tandas reales dentro del flujo normal de trabajo, y se consolida (o revierte) según la evidencia registrada. |
| **Ciclo completo con LLM en cron** | Paga tokens en cada corrida aunque no haya nada nuevo, y por R5 igual no puede tocar prod — pagás para obtener lo que los scripts 0-token dan gratis. |

## El ciclo v2.0 completo

```
   sesión de trabajo                        entre sesiones (0 tokens)
        │                                          │
        ▼                                          ▼
  PROMPT MAESTRO ──► humano elige ──► sensor    watch-sensores.js (cron)
        ▲            registrado ───────────────►  mide al vencer
        │                                          │ propone score + evidencia
        │                                          ▼
  reflexión con ◄──── Telegram: "propone 1.0 (conteo 0 en 7d)"
  score pre-armado
        │
        ▼
  humano confirma (1 palabra) ──► bitácora ──► consolidador ──► mutador (con OK)
```

Intervención humana por ciclo: **dos palabras** ("dale" al aplicar, "ok" al
confirmar). Pero esas dos palabras son donde vive toda la señal de aprendizaje.
