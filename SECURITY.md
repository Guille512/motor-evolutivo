# Security & Privacy

This repo is markdown files plus one small optional Node.js script — there's
no server, no account, no user data collected by the project itself.

## Data & telemetry

- The protocol (master prompt + logbook) never leaves your machine. It's
  plain text you paste into your own agent's context — nothing is sent
  anywhere by the act of using it.
- The optional [`scripts/watch-sensores.js`](scripts/watch-sensores.js) only
  calls the APIs **you** configure in your own `.env` (your own stack —
  N8N, NocoDB, whatever you point it at). It never phones home to me or to
  any third party. Read it end to end before running it — it's under 200
  lines, plain `https` calls, no hidden dependencies.
- No signup, no API key, no account required to use the core protocol
  (`prompts/`, `skill/`, `examples/`). The sensor script is 100% optional.

## Reporting a concern

If you find something that looks like a security issue — in the script, in
a dependency, anywhere — open a GitHub issue or email
guillefernandez88@gmail.com. No bug bounty program, but I'll respond and
fix.
