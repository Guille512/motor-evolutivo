// src/cli/motevo.ts
import { Command } from "commander";
import { createVigia, VigiaConfig } from "../vigia/vigia-skeleton";

const program = new Command();

program
  .name("motevo")
  .description("CLI for motor‑evolutivo – manage vigías and run pipelines")
  .version("0.1.0");

program
  .command("run")
  .description("Run a vigía by name")
  .argument("<name>", "Name of the vigía to execute")
  .action(async (name: string) => {
    // In a real project this would load config from a file; here we mock.
    const cfg: VigiaConfig = { name };
    const vigia = createVigia(cfg);
    await vigia.run();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
