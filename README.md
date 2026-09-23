# Motor Evolutivo 🧬 — by [Guille Fernández](https://github.com/Guille512)

🇪🇸 **[Leer en español](README.es.md)** · 🇬🇧 You're reading the English version

[![License: MIT](https://img.shields.io/github/license/Guille512/motor-evolutivo?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Guille512/motor-evolutivo?style=flat-square)](https://github.com/Guille512/motor-evolutivo)
[![Protocol](https://img.shields.io/badge/protocol-markdown--only-blue?style=flat-square)]()
[![Made with Claude Code](https://img.shields.io/badge/made%20with-Claude%20Code-CC785C?style=flat-square)](https://claude.com/claude-code)

**A master prompt that improves itself with real evidence — no retraining, no infrastructure, no datasets.**

![Motor Evolutivo cycle diagram](docs/demo.png)

> 🖥️ **Works in any terminal, with any LLM agent.** The core is plain
> markdown — it doesn't depend on Claude Code. It runs the same way with
> Cursor, Windsurf, aider, Gemini CLI, Copilot Chat, or by pasting the
> prompt directly into any web chat. Claude Code is the ONLY optional part
> (a skill that automates the cycle) — if you don't use it, the protocol
> works exactly the same by hand.

---

## What is this?

Most prompt self-improvement frameworks ([GEPA](https://github.com/gepa-ai/gepa), DSPy) are **code libraries**: you need Python, evaluation datasets, and an optimization pipeline.

Motor Evolutivo is something else: a **markdown protocol** that turns your LLM agent into a system that learns from its own real work sessions. No code required. The principles are the same as GEPA (natural-language reflection beats numeric reward), but the "dataset" is your actual sessions and the "optimizer" is a supervised reflection cycle — the human closing the loop each time, not a rollout harness.

```
   session opens                    task chunk closes
       │                                  │
       ▼                                  ▼
 context-radar ──► MASTER PROMPT ──► human picks ──► closing-reflection
       ▲                  │                                │
       │            novelty-filter                   append to logbook
       │                                                    │
       └──────────── consolidator ◄──── prompt-mutator ◄────┘
                    (every ~5 uses)      (weekly, human-approved)
```

**The result:** an agent that never proposes the same thing twice, that verifies its assumptions before suggesting a fix, and whose master prompt is measurably better this week than last week — with a git-versioned changelog to prove it.

## The 12 rules (the core of it)

| Rule | What it does | Which real failure it came from |
|------|---------------|----------------------------------|
| **R1 NOVELTY** | Never repeat a move already done, rejected, or ignored twice | Recycled proposals, session after session |
| **R2 ORDERING** | Proposal #1 is always the most concrete real pain (an actual error in the logs, not a nice idea) | "Interesting" proposals that ignored what was actually broken |
| **R3 CURIOSITY** | At least 1 proposal 🧪 in an unexplored direction | Premature convergence (GEPA's Pareto principle) |
| **R4 GROUNDING** | Every proposal cites its source: historical / current / roadmap | Proposals with no verifiable anchor |
| **R5 SUPERVISION** | Propose, NEVER execute production alone | A real production incident |
| **R6 REVALIDATE** | When claiming "X is broken/healthy," paste the evidence (log, timestamp) IN the same sentence. **R6-b:** a control written in the same session — test, self-test, assert, monitor, guard, evidence generator — is not coverage until you have seen it go RED for the case it exists to catch. **R6-c:** re-read pending mutations before proposing a new one | 11+ unverified claims found in the logbook · 4 instruments in 2 weeks that were themselves the broken thing, all with their own test green |
| **R7 VERIFY-BEFORE-PROPOSING** | Before proposing "fix X," verify X is actually broken — as a field: every play that assumes a state carries `Premise: … · seen: <command> → <result>`; without it the play can only be "verify X". **R7-b:** before ruling on *another agent's* proposal, read the real code it touches — and demand the new capability before the tidiness. **R7-c:** before writing a handoff that instructs concrete mechanisms on a foreign machine (git pull, script, service, deploy dir), verify by read-only effect that they exist there | Phantom-fix proposals based on stale memory · verdicts written about a text instead of the codebase |
| **R8 EXECUTION ROUTING** | Every proposal names its cheapest capable executor; the reasoning agent only does what nobody else can | Plays deferred for lack of an owner + the expensive agent doing cheap work |
| **R9 OWN KNOWLEDGE** | Re-read what you already wrote down about a tool before using it | 3 errors the agent already had the documented fix for, unconsulted |
| **R10 DEFERRED FOLLOW-THROUGH** | If anything was deferred, play 1 is the oldest deferral picked back up as-is; surviving two rounds undecided, it leaves the list named as blocked, with its blocker | Deferring the uncomfortable RAISED effectiveness: the curve only counts what was decided, so a deferred play vanished at no cost |
| **R11 ADVERSARIAL TEST** | A play delivering code/script/monitoring must have its verification vary at least one dimension the play did NOT name — an axis orthogonal to the change | 2 of 2 same-day deliveries shipped with a green self-test and the bug still alive: the cases only varied what the ticket asked to fix |
| **R12 MENU HYGIENE** | A play takes one of 3 slots; if it doesn't earn it, it isn't proposed. No detour while a priority thread has the clock running; no structural filler (self-discarded plays, subset pairs, mistimed audits, the engine's own chores); the play that converts closes the open thread; off-keyboard human actions are not plays - they go to a cumulative blockers block with a recipe, and the engine never stalls on them | 8 rules about the play menu had been consolidated for months in another tool's memory the engine never reads at open — 1 of 8 had reached the master prompt |


None of these rules came from theory. **They're all scars** — each one has the date and the failure that caused it in the changelog.

## The metric (v1.6 — anti-saturation, self-correction, deferrals, block acceptance)

Every closed task chunk logs which proposal was picked:

| Score | Meaning |
|-------|---------|
| **1.0** | Chosen **with discard** — the human picked a subset, reordered it, or asked for something else: their reply carries information the engine did not have |
| **0.75** | **BLOCK ACCEPTANCE** — the whole block came back with nothing discarded. That is a "go ahead", and a "go ahead" measures adherence, not aim |
| **0.5** | Absorbed / reworded by the human |
| **0.5★** | **SELF-CORRECTED**: R7 nulled the proposal on a false premise BEFORE touching prod. A POSITIVE signal — the engine caught its own bad move |
| **0** | Ignored or rejected while well-founded |
| **D** | **DEFERRED** — proposed, but the human neither decided nor executed it. Does **not** enter Y (counting it 0 punishes what was not a rejection; counting it 1.0 inflates). Listed separately so it cannot hide |

Three protections we learned the hard way, each after the curve lied to us once:
- **Absorbed proposals must never count as chosen** — that inflated our curve to a false 93% and left it with zero signal.
- **A whole block pasted back is not a bullseye** — five entries in a row scored ~1.0 while the proposals were not getting better. The human had simply started returning the entire block as shorthand for "go ahead". Same failure as the first one, through a different door.
- **Every logbook entry names the weakest proposal** — a logbook where everything looks great teaches nothing.

## Real results (not a benchmark — production)

![A real closing reflection](docs/reflection-example.png)

> A **real closing reflection** — this one from the chunk that produced this very
> README update (2026-07-25). Sanitized (client names removed) and typeset for
> legibility; the scores, the named weakest play and the self-correction are
> verbatim from the logbook. Source: [`docs/reflection-example.html`](docs/reflection-example.html).


Running since June 2026 across 3 production projects (N8N automation for dental clinics + an agency):

- **32 approved mutations** of the master prompt (v1.0 → v3.13) in ~15 weeks, each grounded in real executions — [full dated history, sanitized →](docs/CHANGELOG-HISTORY.md)
- **The engine catches itself:** an effectiveness curve saturated at 93% triggered a redefinition of its own metric. R6 failed against its own author → it produced its own operative version. The metric was punishing the best safety mechanism → it corrected itself the following window.
- **~50% effectiveness curve** post-correction — and that's the healthy number: 100% means your metric is broken, not that your agent is perfect.
- **v2.0a — bounded autonomy:** measurable proposals declare a `sensor:` (metric + window + threshold), and a 0-token script measures them on its own and proposes the score with evidence. Principle: **automate the EVIDENCE, never the DECISION.**
- **v2.1 — Dream Review:** the closing reflection now also checks the logbook for the same *manual* task repeated 3+ times without its own automation — and suggests the exact paste-ready prompt to package it as a skill. Suggestion only; the human decides (R5 intact).
- **v2.2 — deferred state:** the metric adds a `D` (deferred) state for proposals nobody decided on this chunk — it doesn't count as a 0 or a 1.0, it's tracked separately as `% deferred`, so a "propose without follow-through" pattern can't hide inside a healthy-looking score.
- **v2.3 — execution routing (R8):** every proposed play must name its cheapest capable executor (another agent in your roster, a 0-token script, a cheap model) — the reasoning agent only executes what nobody else can. A play without an executor is incomplete. Born from real signal: plays kept getting deferred for lack of an owner, and the expensive agent kept executing work a cheaper one could do.
- **v2.4 — delegation bounce:** the closing reflection gains a mandatory `Bounce: X/N` line — how many delegated deliverables had to be bounced back for correction, out of those verified this chunk. Effectiveness measures what the orchestrator *proposes*; bounce measures what the ecosystem *delivers*. Born from a multi-agent ecosystem analysis: the curve had been flat at 100% for 12-13 chunks (a broken-metric smell) and coordination — not capability — was the dominant cost.
- **v2.5 — own knowledge (R9):** before invoking a tool, designing an artifact or recommending one in a play, the agent must re-read the findings it *already wrote down* (memory, the component's own doc, the logbook) and apply them on the first try. Distinct from R6 (read the real component) and R7 (verify system state): R9 targets knowledge that already exists in writing and simply wasn't consulted. Born from 3 real occurrences across 2 chunks of the exact same pattern — the agent had the knowledge to prevent the error, caught it only in later self-correction, and paid avoidable cycles.
- **v2.8 — the engine learned to audit instead of opine:** it had a rule for verifying its *own*
  assumptions before proposing, and none for the case that had quietly become frequent —
  *evaluating what another agent proposes*. R7-b now forces reading the actual code a proposal
  touches before ruling on it. What made the rule: in the verdict that triggered it, 80% of the
  value delivered wasn't the ruling on the five proposals — it was a bug none of them mentioned
  (three API routes silently falling back to one tenant's data when a query param was missing,
  returning 200 all the while). Two filters came with it: **demand the new capability before the
  tidiness** — if "what can you do afterwards that you couldn't before?" answers "nothing, it's
  cleaner", the refactor is debt under another name — and any *move this config into the
  database* proposal must declare what part of it isn't data (a CSS framework's classes don't
  survive static purging from a table; a component isn't serializable).
- **v3.13 - the premise becomes a field of the play, not a rule to remember (R7):** a 14-day audit, cross-checked by an independent model, found an unverified premise behind 11 of 25 weak plays — with R7 written weeks earlier — and effectiveness flat at ~80% across 6 mutations. More text wasn't changing behavior, so the output shape changed instead: each play carries `Premise · seen: <command> → <result>`, or it can only be "verify X". The rule got shorter, not longer.
- **v3.12 - self-knowledge that missed the first pass gets a guard, not just a memory (R9-c):** content carrying backslashes, `\n`, backticks or `$` (a Windows-style path, a regex, a script with escaped code) has to be written with the editor's direct write, or from a temp file the script reads — never inline through an intermediate shell (`printf`, an unquoted heredoc, `python -c`, `node -e` with the text baked in, `sed` with the path inside the pattern). Each shell layer consumes one layer of escaping and executes any backtick along the way; the destination comes out mutilated and the command's own green says nothing about it. The finding had already been written down as knowledge (R9, v2.5) and still fired five times in 48 hours: two inline scripts mangled mid-write, a scheduled-task wrapper left without its path separators that then failed silently, a path committed with its separators eaten, a regex edit that silently stopped matching. Extends the scope of R9 (precedent v2.9/v3.0), no new rule — but this time the memory alone didn't hold, so it also ships **its own pre-execution guard**: a check that inspects the exact shell command before it runs and blocks the pattern. Proof of red: sabotaged against 14 real commands pulled from the session that produced it (5 that must block, 9 legitimate ones that must not) — caught a false positive in its own first draft (a quoted heredoc piped to an interpreter doesn't get expanded by the shell and was being blocked anyway) and a blind spot (a multi-line write hid its own backslashes past the point the check was reading up to). Fixed both, then watched it block, live, the exact kind of command it exists to stop.
- **v3.11 - adversarial review before the receipt (R11-b):** a rewritten workflow (9→6 nodes) had been measured in production and closed with a receipt. One pass by a different model over the pasted JSON found 3 real bugs - one of them weeks old: replacement characters (U+FFFD) inside the keys of a column mapping, so 3 columns had been written empty the whole time. The author had *looked at those keys and dismissed them* by analogy with a harmless mojibake seen before. Same week, two deliveries from another agent shipped with a green self-test and a security hole each (auth bypass by header presence; query injection) that only a full read caught. R11 said "vary a dimension you didn't name"; the author can't reliably name the dimension they're blind to. So for two cases only - a rewritten workflow, or code touching a trust boundary - the unnamed dimension comes from another head, before the receipt, and the receipt cites its worst finding. Limited to two cases so the reviewer's quota isn't spent on one-field fixes.
- **v3.10 - the red runs where the guard lives (R6-b ii):** a deploy canary had been "seen red" three times - each time by running the block loose in a shell. Inside the real script, under `set -euo pipefail`, a `grep` on a missing env file returned 2 and killed the deploy silently on that line; that same morning the container-side probe said "could not test (no curl)" and let everything through. Both reds existed on paper; neither had ever executed in the place the guard was going to live. Now the proof of red only counts if it ran in the same script, flags, container and runner - and a "skip" branch is a red, not a pass.
- **v3.9 - the executor gets wired at close (R8):** the routing rule said every play names its cheapest capable executor - and it worked, on paper. Then one session went through the backlog looking for fuel for a delegate agent's autonomous loop (an agent that only consumes tickets tagged for it) and found **zero** tickets addressed to it, while several previous closes had plays tagged "executor: that agent". A play in prose never fed the loop. Same class of drift as v3.7/v3.8: the rule governed the *label*, not the *hand-off*. Now a play delegated to a ticket-driven agent becomes a ticket in the same close, and a play delegated to a cheap brief-driven model carries the model alias and the brief next to it. The cheapest executor in the roster (a cloud-hosted open model, "the bricklayer - it shouldn't have to think much", in the human's words) also enters the routing list explicitly, with a closed brief as its input.
- **v3.8 - off-keyboard actions are not plays (R12-d):** two rounds in a row, the menu proposed things only the human can do away from the keyboard - pay a subscription, call a contact, click through an external dashboard. He didn't do them mid-session (of course), the engine scored them as ignored, and Effectiveness read 0.33 and 0.56 while the plays the engine could actually execute were almost all taken. The rule "off-keyboard actions are not plays" had existed since the v1.6 metric - in the scoring step of a helper skill, not in the master prompt that builds the menu. Same finding as v3.7, one rung down: the rule lived where the score gets corrected, not where the decision gets made. Now they go to a cumulative `⛔ Blockers - your court` block, each with a clickable recipe (the human's own words: "many I don't know how to do - tokens, lots of clicks"; "I gather them all and do them in one go"; "what I don't want is for you to stop"), and the engine's play is whatever it can leave ready meanwhile.
- **v3.7 - a rule the executor never reads governs nothing (R12):** while refactoring the helper skills by real usage, the 8 "consolidated rules" about the play menu turned out to live in the memory file of a helper skill invoked a handful of times a month - not in the master prompt the opening hook actually runs. Only one ("no detour with an active thread") had made it across, and only as a special case of the pre-proposal verifier. Three of the eight were genuinely missing and were promoted as one rule so the effect can be attributed: no menu while a priority thread has the clock running (close with that thread's next step), no structural filler (a play named only to be discarded in the same turn, two options where one is a subset of the other, an adversarial review offered before the underlying decision is on the table, the engine's own chores competing for a slot), and the play that converts is the one that closes what the round left hanging. The other five were already covered elsewhere and were not duplicated. Same finding as the instrumentation of the no-duplicate rule, one level up: text that the executor does not load is intention, not a rule.
- **v3.6 - a green that only exercises what the play named proves nothing (R11):** if a play delivers code, a script or a monitor, its verification must vary at least one dimension the play did not name. Triggered by 2 of 2 same-day deliveries from another agent in the roster, both landing with a green self-test and the bug still alive: a dedupe tested only with the collection in input order (breaks with the order reversed); a validator tested only with the field absent (passes with the field present but invalid, and fails open); a zone filter tested with a single zone (collides across scopes). The delivery contract ("every delivery ships a negative control") was being met in all three cases - the hole was not the absence of the control, it was its design. The clause that makes it bite: the varied dimension has to be an orthogonal axis to the change (order, shape of the malformed input, isolation scope, null/boundary state) - without it the rule is satisfied by a cosmetic dimension and catches nothing. Deliberately not a 3-case checklist: those are the bugs of that one day; as an obligation they become ceremony and leave out the next dimension.

- **v3.5 - a contract naming terrain nobody verified:** before writing a handoff or ticket that instructs concrete mechanisms on a remote machine - run a git pull, execute this script, restart that service, sync into that deploy directory - verify by read-only effect that the mechanism actually exists there: the path exists, it is a git repo, the script does what the contract says. Fourth occurrence of the pattern in five weeks: a deploy directory that was not a git repo; a production environment file overwritten mid-redeploy; a handoff JSON carrying invented credential IDs; an automatic backup pointed at a hand-edited docs folder for months. Without that check a handoff is prose; with it, it is a procedure. The contract names the terrain; the terrain decides whether the contract is executable.
- **v3.4 - the tool-suggestion block was a rule escaping into its own section:** the agent closed every answer with a second block recommending commands and features of the harness it runs on. That block came from the agent's config file, not from the engine - and living outside the engine it lost all three filters that make everything else serious: novelty (it repeated commands across rounds), premise-verification (it once proposed history surgery on a commit that had **already been pushed**, a false premise nobody checked), and above all the metric - it never entered Y, so proposing badly there **cost nothing**. Those are the most frequent suggestions of all, and the only ones that were free. The tell that the boundary had already dissolved in practice: twice in one day the human pasted the *tool* block back, not the engine's, and it was executed as engine plays with nobody noticing the crossing. v3.4 folds them in: a play whose executor is a harness command goes in "next plays" with its executor tag, and scores like any other. **R9-b is repealed** as unnecessary - it existed only because the closing block was drafted outside the evidence filter, which its own text admitted; with one block there is one filter. Its substance (check a recurring task against already-installed jobs) survives inside R8. Accepted cost: the curve will DROP, because the most frequent plays start counting. That is the point - v3.1 and v3.2 attacked saturation in *how* things are scored; this one attacks what was never counted at all.
- **v3.3 - two hard rules were claiming the same slot, added the same day without seeing each other:** R2 said "play 1 is ALWAYS the most concrete pain"; R11, shipped hours earlier, said "play 1 is the oldest deferral". Both live, both pointing at slot 1, so the tie was settled by the agent's judgment - the exact thing rules exist to prevent. Fixed by scope, not by a new rule: R2 now governs the first **new** play; R11 takes slot 1 **only if deferrals exist**, and if none do it takes nothing. Rejected alternatives: raising the cap to 4 plays (inflates the block, which is the problem v3.1 and v3.2 came to attack) and listing the deferral separately (removes it from the priority order, i.e. makes it optional again - precisely the failure mode R11 was born from).
- **v3.2 - a deferred play that nobody picks back up doesn't stay put, it blocks future work (R11):** nothing forced a deferral to return. It vanished at no cost, and **the effectiveness curve did not penalize it** - Y only counts what was decided, so deferring the uncomfortable RAISED the rate. Hidden saturation, and the `% deferred` signal existed to detect it but had no mechanism behind it. Triggered by signal, not by cadence: `% deferred` over the 30% threshold **three consecutive rounds** (33% - 33% - 36%). The witness case: restoring an expired OAuth credential for a client's calendar, proposed one day, never decided, silently absent from the two following rounds - and three days later it was exactly what made it impossible to close a workflow's firing test. R11: if deferrals exist, play 1 is the oldest one picked back up as-is (max 1, the cap does not rise); one surviving two rounds without a decision leaves the list and is named **blocked, with its blocker** - a deferral that reappears forever is noise, not follow-through.
- **v3.1 — the metric stopped discriminating, so the metric changed:** five consecutive log entries scored ~1.0 (1.0 · 0.92 · 1.0 · 1.0 · 0.96) while the plays themselves were not getting better. The reason was mundane: the human had started pasting the entire "next plays" block back as shorthand for "go ahead", and the metric read that as "chosen exactly as proposed = 1.0" for every play, every time. This is the **same failure v1.2 already fixed once, returning through a different door** — v1.2 killed saturation from *absorbed* plays; this was saturation from *block acceptance*. Metric v1.6: a play accepted as part of a whole block, with nothing discarded, is worth **0.75**; the full 1.0 requires that the human picked a subset, reordered it, or asked for something else — a reply carrying information the engine did not already have. It does not measure the human's trust, it measures the engine's ability to **discriminate between its own plays**: a whole segment at 0.75 honestly says "all passed, none stood out". Confirmed live twice over — the message approving this mutation was itself a three-play block pasted back whole, with the mutation inside it.
- **v3.0 — a control isn't coverage until you've seen it fail (R6-b):** four times in two weeks the broken thing was the *instrument*, and all four had their own test passing: async tests that never awaited their promises; an alarm the agent had armed itself the day before; a self-assert that measured arithmetic instead of the path it claimed to exercise; and — the one that forced the rule — the **receipt generator**, the piece whose entire job is to make a PASS derive from tooling instead of from the agent's prose. A shell call was re-joining arguments without re-quoting them, so any quoted pattern got split: a negative control that must fail returned exit 0. It had put a machine signature on a false statement, and it had never had a self-test at all. R6-b: a control written in the same session is not coverage until you have broken what it protects on purpose and pasted the red. **Deliberately not a tenth rule** — same reasoning as R9-b: R6 already covered evidence, only its scope was missing. Shipped alongside **R6-c** (re-read pending mutations before proposing a new one), which exists because *this very mutation was proposed twice on the same day by two sessions that couldn't see each other* — a duplicated mutation inflates the same "repeated pattern" signal it uses to justify itself.
- **v2.9 — the closing block counts too (R9-b):** R9 already required re-reading what the agent had written down before acting — but it was only ever applied to the body of a response. The two or three tool recommendations appended at the end of every answer were drafted last, outside that filter. Same antipattern three times: recommending a recurring watch for something an already-installed scheduled job covered (self-retracted on execution; consolidated into memory eleven days later; then proposed again — and this time *chosen by the user* before being retracted). R9-b extends the scope: any recommended recurring task or new monitor gets contrasted against the jobs already running before it's offered; if it's covered, propose the remaining gap or nothing. **Deliberately not a tenth rule** — R9 already covered the case, only its scope was missing, and a new rule would have duplicated it and made the effect unattributable. One thing mutated: where R9 applies.
- **v2.6 / v2.7 — the engine scores itself from real data:** a 0-token collector derives 2 of the 5 dimensions of the agent baseline from evidence instead of judgment. **Autonomy** ← freshness of each loop agent's heartbeat. **Integration** ← close rate of tickets addressed to that agent in the shared channel, penalized by the age of the oldest open one — with an **explicit `N/A` below 3 tickets** (insufficient data is a valid state, not a 0 and not a fake average). Same principle as v2.0a: **automate the evidence, never the decision.** A finding along the way (R7 at work): the files that *looked* like heartbeats were actually the watchers' own dedup state — the real heartbeats lived somewhere else, and the collector was pointed there.

The client work behind these numbers is under NDA, so the full private logbook can't be published — but [`examples/bitacora-ejemplo.md`](examples/bitacora-ejemplo.md#003) includes one **real, sanitized entry** (identifying details replaced, mechanics and score untouched): an R7 verify-first check that caught real client data about to leak into a public asset, scored 0.5★ (self-correction, not a failure).

## Quickstart (5 minutes, any terminal)

Nothing below requires Claude Code — these are plain text files you paste
into the conversation with your agent, whatever terminal or chat you use.

1. **Copy** [`prompts/motor-evolutivo-template.md`](prompts/motor-evolutivo-template.md) into your repo and fill in the `{{placeholders}}` (agent name, project, where your roadmap lives).
2. **Create the logbook** — a `learnings/aprendizajes.md` file with the template's header (or copy [`examples/bitacora-ejemplo.md`](examples/bitacora-ejemplo.md)).
3. **When you open a work session:** paste the master prompt to your agent (Claude Code, Cursor, aider, ChatGPT, whatever you use) → it gives you up to 3 proposals with rules R1-R12 already applied.
4. **When you close the chunk:** paste the `reflexión-de-cierre` sub-prompt (≤5 lines) → append to the logbook with `Efectividad: X/Y`.
5. **Once a week:** the mutator proposes ONE improvement to the master prompt based on the last 5 reflections. You approve it → changelog. You reject it → that's also signal, and it goes in the logbook too.

**Optional — only if you use Claude Code:**
- Install [`skill/SKILL.md`](skill/SKILL.md) into `~/.claude/skills/motor-evolutivo/` — the full cycle (steps 3-5) runs by just saying "motor," no manual copy/paste.
- **Instance guard:** `node scripts/check-instancia.js prompts/motor-evolutivo.md --skill ~/.claude/skills/motor-evolutivo/SKILL.md` — fails on leftover placeholders, missing `plantilla:/serie:` header, missing bitácora or entries from another series, or a skill that points at a different instance. Run it (or cron it) before trusting your own engine. Several agents: one mechanism (this repo), N instances, one series each — see the template header (federation + reactive mode).
- **0-token sensors:** [`scripts/watch-sensores.js`](scripts/watch-sensores.js) is plain Node.js — runs in any terminal (not just Claude Code) via cron/Task Scheduler, measures the outcome of applied proposals (via your stack's API) and alerts over Telegram, without spending a single LLM token.

## Repo structure

```
├── prompts/motor-evolutivo-template.md   ← THE master prompt (generic template)
├── skill/SKILL.md                        ← Claude Code cycle operator
├── scripts/check-instancia.js            ← instance guard (self-test 13/13)
├── scripts/watch-sensores.js             ← 0-token score-collector (optional)
├── examples/bitacora-ejemplo.md          ← example logbook with sample entries
└── docs/arquitectura-autonomia.md        ← the full v2.0 plan (what to automate and what NOT to)
```

## When NOT to use it

- If you want massive automatic optimization against a dataset → use [GEPA](https://github.com/gepa-ai/gepa) directly, that's what it's built for.
- If nobody is going to do the closing reflection → without that step the engine does NOT evolve; it's just a static prompt with a different name.
- If you want the agent to execute production unsupervised → this protocol is explicitly the opposite (R5). The learning signal IS the human decision; remove it and the engine scores itself (we've seen how that ends: an inflated curve with zero information).

## Grounding

| Principle | Source |
|-----------|--------|
| Natural-language reflection beats numeric reward | [GEPA — "Reflective Prompt Evolution Can Outperform Reinforcement Learning" (arXiv 2507.19457)](https://arxiv.org/abs/2507.19457) |
| Try → Reflect → Consolidate without retraining | ACE (Agentic Context Engineering) |
| Candidate tree, not premature convergence | GEPA (Pareto selection) |
| The prompt as a revisable process, versioned in git | 2026 agent-memory survey |

## Attribution

If this protocol (the R1-R12 rule set, the v1.6 metric, or the bounded-autonomy
sensor pattern) shows up in your own writeup, talk, or product, a link back
here is appreciated — it's what keeps this tied to where it came from:

> Motor Evolutivo — Guillermo Fernández, 2026. https://github.com/Guille512/motor-evolutivo

## Privacy & security

No telemetry, no account, no API key needed for the core protocol — it's
markdown you paste into your own agent. The one optional script only calls
APIs **you** configure, never phones home. Full policy: [SECURITY.md](SECURITY.md).

## License

MIT — [Guillermo Fernández](https://github.com/Guille512). If you use it and the engine teaches you something, tell the scar in an issue: other people's rules are the best changelog.
