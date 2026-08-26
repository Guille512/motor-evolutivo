# Real mutation history — production instance

> This is the **actual, dated changelog** of the master prompt running in my production
> ecosystem (several parallel automation projects), sanitized for publication: client names,
> workflow IDs and internal paths removed — dates, reasoning and outcomes are literal.
> The template in [`prompts/motor-evolutivo-template.md`](../prompts/motor-evolutivo-template.md)
> ships clean at v1.0 so you start your own history.
>
> **23 approved prompt mutations between 2026-06-10 and 2026-08-25.** Two extra entries
> (v1.1, v1.2.1) are infrastructure/process changes that did not touch the master prompt —
> listed for completeness, not counted.

---

- **v3.4 — approved 2026-08-25:** **one block of plays, not two.** The agent had been closing every answer with a second block recommending commands and features of the harness it runs on. That block came from the agent's own config file, not from the engine - and living outside the engine it lost all three filters that make everything else serious: **novelty** (it repeated commands across rounds), **premise-verification** (it once proposed history surgery on a commit that had *already been pushed* - a false premise nobody checked before offering it), and above all **the metric**: it never entered Y, so proposing badly there cost nothing. Those were the most frequent suggestions of all, and the only free ones.
  The tell that the boundary had already dissolved in practice: twice in a single day the human pasted the *tool* block back rather than the engine's, and it was executed as engine plays with nobody noticing the crossing. The system was insisting on a distinction the workflow had already erased.
  v3.4 folds them in - a play whose executor is a harness command goes in "next plays" with its executor tag and scores like any other - and **repeals R9-b** as unnecessary. R9-b was a patch on the symptom, and its own text confessed it: "the gap was not knowledge, it was that the closing block gets drafted last without passing the evidence filter demanded of the body." With one block there is one filter. Its substance (check a recurring task against already-installed scheduled jobs) survives inside R8.
  **Accepted cost:** the curve will drop, because the most frequent plays start counting. That is the point - v3.1 and v3.2 attacked saturation in *how* things are scored; this one attacks what was never counted at all.

- **v3.3 — approved 2026-08-25:** **two hard rules were claiming the same slot.** R2 said "play 1 is ALWAYS the most concrete pain"; R10 (R11 in the private instance), shipped hours earlier the same day, said "play 1 is the oldest deferral". Both live, both pointing at slot 1, added without either seeing the other - so the tie was settled by the agent's judgment, which is the exact thing a rule exists to prevent.
  Fixed by **scope, not by a new rule**: R2 now governs the first *new* play; R11 takes slot 1 **only if deferrals exist**, and if none do, it takes nothing and slot 1 returns to R2. Rejected alternatives: raising the cap to 4 plays (inflates the block, the very problem v3.1 and v3.2 came to attack) and listing the deferral separately (removes it from the priority order - i.e. makes it optional again, precisely the failure mode R10 was born from). Same precedent as v2.9 and v3.0: mutate the *scope* of existing rules rather than add another one.

- **v3.2 — approved 2026-08-24:** **a deferred play that nobody picks back up doesn't stay put - it blocks future work (R10).** Nothing forced a deferral to return. It vanished at no cost, and **the effectiveness curve did not penalize it**: Y only counts what was decided, so deferring the uncomfortable RAISED the rate. Hidden saturation - and the `% deferred` signal existed to detect it but had no mechanism behind it.
  Triggered by signal, not by cadence: `% deferred` over its 30% threshold **three consecutive rounds** (33% - 33% - 36%). The witness case: restoring an expired OAuth credential for a client's calendar, proposed one day, never decided, silently absent from the two following rounds - and three days later that was exactly what made it impossible to close a workflow's firing test.
  R10: if deferrals exist, play 1 is the oldest one picked back up as-is (max 1, the cap does not rise); one that survives two rounds without a decision leaves the list and is named **blocked, with its blocker** - a deferral that reappears every round forever is noise, not follow-through.

- **v3.1 — approved 2026-08-24:** effectiveness metric raised to **v1.6 — block acceptance**.
  A play chosen because the human pasted **the whole block back, discarding none** is now worth
  **0.75**, not 1.0. The full 1.0 is reserved for when they picked a *subset*, reordered it, or
  asked for something different — that is, when their reply carries information the engine did
  not already have.
  *Why:* five consecutive log entries scored ~1.0 (1.0 · 0.92 · 1.0 · 1.0 · 0.96) while the plays
  themselves were not getting better. The human had simply started pasting the entire "next plays"
  block back as shorthand for "go ahead", and under v1.4 that reads as "chosen as proposed = 1.0"
  for every play, every time. This is the **same failure v1.2 already fixed once, returning
  through a different door**: v1.2 killed saturation from *absorbed* plays, this one is saturation
  from *block acceptance*. A curve that climbs no matter what is decoration, and the mechanism
  built to prevent exactly that did not cover this case. Confirmed live, twice over: the message
  approving this mutation was itself a three-play block pasted back whole, with the mutation
  inside it.
  **What it measures:** not the human's trust — the engine's ability to **discriminate between its
  own plays**. A whole segment at 0.75 means "all of them passed, none stood out", which is honest
  information. Earning a 1.0 now requires proposing something uneven enough to be worth choosing
  between.

- **v3.0 — approved 2026-08-22:** R6 (revalidate) extended with **R6-b: proof of red** — a
  control written in the same work chunk (test, self-test, assert, monitor, guard, evidence
  generator) does not count as coverage until it has been seen to go RED for the case it exists
  to catch. Running it green is not enough: you break what it protects on purpose and paste the
  red. It is the guard rule applied to the instrument itself.
  *Why:* four occurrences in two weeks, and in all four the instrument was the broken thing while
  its own test passed — (1) async tests that never awaited their promises; (2) an alarm the agent
  had armed itself the day before, so the test could not fail; (3) a self-assert that measured
  arithmetic instead of the code path it claimed to exercise; (4) the receipt generator itself —
  the component whose entire purpose is that a PASS is *derived by tooling* rather than written by
  the agent — silently emitting false green, because its shell invocation re-joined arguments
  without re-quoting them and split any quoted pattern. A negative control that had to fail
  returned exit 0. That component had never had a self-test at all. The rule had already been
  stated as a loose line in occurrence (1) and was broken twice more after that, which is what
  moved it into the master prompt.
  **Deliberately not a tenth rule** — the same reasoning as v2.9's R9-b: R6 already covered
  evidence, only its scope was missing, and a new rule would have duplicated it and made the
  effect unattributable. One thing mutated: where R6 applies.
  Shipped with **R6-c: do not duplicate a mutation** — re-read the pending, unapplied mutations
  before proposing a new one. Origin: *this very mutation was proposed twice on the same day, by
  two sessions of the same agent that could not see each other*, under two different names, and
  the collision was only caught while reading the handoff memory at close. A duplicated mutation
  inflates the same "repeated pattern" signal it uses to justify itself — the engine would have
  been counting its own echo as evidence.
- **v2.9 — approved 2026-08-21:** R9 (own knowledge) extended with **R9-b: the closing block
  counts too**. R9 required re-reading what you already documented before acting, but it was
  only ever applied to the body of a response. The closing block — the two or three tool
  recommendations the engine appends at the end of every answer — was drafted last, without
  passing the same evidence filter. The result was the same antipattern three times: proposing
  a recurring watch task for something an already-installed scheduled job covered (2026-08-06,
  self-retracted on execution; the rule was then consolidated into memory on 2026-08-17; and
  again on 2026-08-21, this time *chosen by the user* before being retracted). R9-b now requires
  contrasting any recommended recurring task or new monitor against the scheduled jobs already
  running and the monitor inventory — if it is covered, propose the remaining gap or nothing.
  **Deliberately not a new rule:** R9 already covered the case; only its scope was missing. A
  tenth rule would have duplicated R9 and made the effect unattributable — so exactly one thing
  mutated: where R9 applies. The scoring detail that made this visible: the retracted play
  scored 0.5★ (self-correction over a false premise) rather than 0, which keeps the engine's
  own safety mechanism from being penalised while still surfacing the repeat.

- **v2.8 — approved 2026-08-03:** R7 (verify-before-proposing) extended with **R7-b: other
  agents' proposals**. R7 only covered the engine's *own* plays that assume a system state. It
  had no rule for a case that had quietly become frequent — *evaluating what another agent
  proposes* (three proposal tickets from the same agent in two days). R7-b now requires reading
  the actual code, schema or config a proposal touches **before** issuing a verdict, and
  reporting as an own finding whatever shows up there and is missing from the proposal. It adds
  two filters: demand the **new capability** before the tidiness (if "what can you do afterwards
  that you couldn't before?" answers "nothing, it's cleaner", the refactor is debt under another
  name), and any "move this config into the database" proposal must first declare what part of
  it **is not data**. **Why now:** in the verdict that triggered this, 80% of the delivered value
  was not the ruling on the five proposals — it was a bug none of them mentioned: three API
  routes falling back to one specific tenant when the query param was missing, silently serving
  another tenant's data with a 200. Second occurrence of that same class in two days. Without
  reading the code, that verdict would have been five tidy opinions about a text. **Expected
  effect, stated up front so it can be falsified:** the next batch of proposals from any agent
  ships with at least one own finding, or the rule did not work. Measured in the next
  closing-reflection entry that evaluates someone else's proposals.
- **v2.7 — approved 2026-07-23:** the auto-score collector gains **Integration** (it only had
  Autonomy). Score = close rate of tickets addressed to each agent across the two repos of the
  single ticket channel, penalized by the age of the oldest open one; **explicit `N/A` below 3
  total tickets** — not a 0, not a fake average: insufficient data is a valid state. **Why now:**
  the migration of all 5 agents onto the single channel closed on 07-23, so the count stopped
  being hypothetical. **Verification run on real data:** 10/10 for the agent with 8/8 closed,
  7/10 for 4/6, 8/10 for 5/6, and honest `N/A` for the two with a single ticket each. Self-test
  15/15. Deliberately left out: the delegation-bounce dimension — it lives in prose inside the
  logbook, not in structured form, and forcing that parse now would invent precision.

- **v2.6 — approved 2026-07-22:** a complementary signal, **Autonomy auto-score**, is added to
  the closing reflection (it does NOT change the X/Y effectiveness metric). A 0-token collector
  derives the Autonomy dimension of each loop agent from the freshness of its real heartbeat.
  **Why:** the quantitative agent baseline left 3 of 5 dimensions as human judgment and 2 as
  derivable — this closes the solid half with real evidence. **A finding along the way (R7 at
  work):** the state files that looked like heartbeats were actually each watcher's own dedup
  state, not a liveness signal — the real heartbeats lived elsewhere, and the collector was
  pointed there instead. Integration was deliberately deferred until the channel migration
  closed (only then is it machine-countable → v2.7). Self-test 8/8 + verified real run.

- **v2.5 — approved 2026-07-21:** new rule **R9 OWN KNOWLEDGE** in the master prompt: before
  invoking a tool, designing an artifact or recommending one in a play, re-read the findings
  already documented that apply (memory, the component's own doc, the logbook) and apply them
  on the first attempt. **Why:** 3 real occurrences across 2 chunks of the same pattern — the
  agent already held the knowledge that would have prevented the error (a documented CLI flag,
  a written-down finding, a memory about a tool broken on this OS) but didn't consult it at the
  moment of acting, catching it only in later self-correction at the cost of avoidable cycles.
  Distinct from R6 (evidence *after* a claim about the real world) and R7 (verify system state
  *before* proposing): R9 targets knowledge ALREADY WRITTEN, not external state. Detected during
  the engine's own closing reflection.

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
