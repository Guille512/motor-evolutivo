# Real mutation history — production instance

> This is the **actual, dated changelog** of the master prompt running in my production
> ecosystem (several parallel automation projects), sanitized for publication: client names,
> workflow IDs and internal paths removed — dates, reasoning and outcomes are literal.
> The template in [`prompts/motor-evolutivo-template.md`](../prompts/motor-evolutivo-template.md)
> ships clean at v1.0 so you start your own history.
>
> **13 approved prompt mutations between 2026-06-10 and 2026-07-17.** Two extra entries
> (v1.1, v1.2.1) are infrastructure/process changes that did not touch the master prompt —
> listed for completeness, not counted.

---

- **v2.4 — approved 2026-07-17:** the closing-reflection metric moves to **v1.5**, adding a
  mandatory **`Bounce: X/N`** line — N = delegated deliverables from other agents the operator
  verified this chunk, X = how many had to be bounced back for correction; `—` if nothing was
  delegated. Trigger: bounce ≥50% for 3 consecutive chunks with delegation → a mutation
  targeting that agent's delivery contract. Origin: a full multi-agent ecosystem analysis found
  (a) the effectiveness curve plateaued at 100% for 12-13 straight chunks — the metric had
  stopped discriminating — and (b) coordination, not capability, was the ecosystem's dominant
  cost: every delegated delivery was already being verified one by one, but the aggregate was
  recorded nowhere, so the signal "which agent delivers badly, and how often" did not exist.
  Effectiveness measures the quality of what the orchestrator PROPOSES; bounce measures the
  quality of what the ecosystem DELIVERS. Chosen over lead time / MTTR / tokens-per-close
  because it is the only zero-cost signal — the evidence already exists at closing time.
  Additive: prior entries read as `Bounce: —`.

- **v2.3 — approved 2026-07-09:** new rule **R8 EXECUTION ROUTING** — every proposed play
  must name its **cheapest capable executor** (another agent in the roster, a 0-token
  script, a cheaper model); the expensive reasoning agent only executes what nobody else
  can. A play without an executor is incomplete. Origin signal: plays kept getting
  deferred for lack of an owner (same refactor deferred across 2 chunks), plus the
  expensive agent repeatedly executing work that belonged to a cheaper one.

- **v2.2 — approved 2026-07-06:** the closing-reflection metric moves to **v1.4**, adding
  the **`D` (deferred)** state — a play that was proposed but neither chosen, rejected nor
  absorbed in the chunk. It does not enter the score; it is listed on a mandatory
  `Deferred:` line and tracked as **`% deferred = D / (Y + D)`**. If `% deferred > 30%`
  for 3 consecutive chunks, a mutation targeting the **"propose without follow-through"**
  pattern fires. Origin: the effectiveness curve had plateaued ≥90% for 12 straight
  entries — and one entry reported a play as "pending" without verifying its channel
  (it had already been handled). A healthy-looking score was hiding undecided work.

- **v2.1 — approved 2026-07-05:** closing reflection gains the **Dream Review** step —
  compare the chunk's task against the logbook; if the same *manual* task type has
  repeated 3+ times without its own automation, suggest the exact paste-ready prompt to
  package it as a skill. Suggestion only; the human decides (R5 intact). Does not overlap
  the consolidator: that one promotes RULES, this one packages PROCESSES.

- **v2.0-a — approved 2026-07-03:** first step of **bounded autonomy** — measurable plays
  declare a `sensor:` (metric · window · threshold); when applied, a 0-token script
  measures the sensor at window expiry and proposes the score **with the evidence
  attached**. The score stays a DRAFT until the human confirms. Principle: **automate the
  EVIDENCE, never the DECISION.** Verified end-to-end against a real production sensor.
  Rejected in the same triage for violating hard rules: auto-applied mutations,
  cross-project meta-coordination, sandbox replicas of production.

- **v1.9 — approved 2026-07-01:** rule R1 (novelty) extended — it is forbidden to propose
  a code/security review of something already verified inline in the same reply; that is
  not novelty, it is redundancy disguised as a proposal. Origin: the logbook recorded the
  same pattern twice in a single day; 100% of that batch's lost score was redundant-review
  plays.

- **v1.8 — approved 2026-06-22:** the *verify-first* sub-prompt is **promoted to rule R7**
  after its promotion gate was met — 3 logged runs with demonstrated value (it exposed a
  missing reflex, prevented deleting rows that didn't exist, and prevented a retry against
  an exhausted quota). Same session as v1.7 but a **separate** mutation, so each change's
  effect can be attributed on its own.

- **v1.7 — approved 2026-06-22:** metric moves to **v1.3** — a third outcome, **0.5★
  self-corrected**, for a play that verify-first kills because its **premise was false**
  before touching production. Why: the curve had dropped to 33%, not because the engine
  was failing but because the metric counted those self-corrections as failures — it was
  **punishing the engine's best safety mechanism**. Now distinguished: `0` = healthy play
  the human didn't pick · `0.5★` = the engine disarmed its own badly-grounded play.

- **v1.6 — approved 2026-06-16:** the *verify-first* sub-prompt goes from candidate to
  **active**: before proposing a play that assumes a system state, run a read-only check
  that confirms it. Trigger: a consolidated anti-pattern re-offended for the 3rd+ time —
  writing a rule down had not installed the reflex.

- **v1.5 — approved 2026-06-15:** R6 gains its **operational hook** — when reporting a
  component as broken OR healthy, paste the evidence (log/state/timestamp) in the same
  claim; without evidence it's a hunch, not a diagnosis. Why: **R6 failed its own first
  test against its own author** — the very next logbook entry claimed "X is broken"
  without checking the log, and there was no bug. Hard lesson: adding a rule doesn't
  install the reflex; the hook IS the reflex.

- **v1.4 — approved 2026-06-13:** rule **R6 REVALIDATE** added — never assert system state
  without revalidating the real component. Signal: 5+ documented occurrences of "claiming
  without rechecking"; the rule caught itself in its very first use (two plays proposed
  without reading the channel where both were already planned).

- **v1.3 — approved 2026-06-13:** an explicit **NORTH** added to the FUTURE horizon —
  every play must ladder toward the ecosystem's actual product goal; the evolutionary
  loop itself is part of the product. Notably, a *second* engine was NOT created for a
  sub-domain: it would have crossed context-separation boundaries between projects.

- **v1.2.1 — 2026-06-11** *(process patch, not counted)*: closing reflection accepts
  multi-agent input via ticket — remote agents submit reflections through a channel, the
  main agent validates format and metric before appending. Remote agents never write the
  logbook directly.

- **v1.2 — approved 2026-06-10:** **FIRST MUTATION.** The closing-reflection metric is
  redefined: chosen-as-proposed = 1.0 · absorbed/reworded by the human = 0.5 ·
  ignored/rejected = 0, and every entry must name the **weakest play** of the batch. Why:
  the first measured curve gave ≈93% — saturated by selection bias (only proposing safe
  plays) and generous accounting (counting reworded proposals as full wins). It was
  measuring approval, not quality.

- **v1.1 — 2026-06-10** *(infrastructure, not counted)*: the operator skill is born — it
  runs the closing reflection, consolidation, weekly mutation and effectiveness curve.
  The master prompt itself didn't change; now it has someone to make it evolve.

- **v1.0 — 2026-06-10:** initial version. Rules R1–R5. Pending: first mutation.
