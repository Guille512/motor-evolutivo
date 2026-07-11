# Architecture

`motor-evolutivo` is built around **vigías** – lightweight monitoring nodes that can be scheduled or triggered on demand. The core consists of:

- **src/index.ts** – public API exporting the main utilities.
- **src/vigia/** – contains the `Vigia` class and helper factory.
- **src/cli/** – a small CLI built with **commander** for local interactions.
- **config/** – YAML files defining vigía definitions and system‑wide settings.
- **examples/** – ready‑to‑run sample projects demonstrating common use‑cases.
- **tests/** – Jest test suite ensuring basic functionality.

The framework is framework‑agnostic; you can embed it in any Node.js/TypeScript project or run it as a standalone service.
