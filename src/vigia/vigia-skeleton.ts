// src/vigia/vigia-skeleton.ts
/**
 * Skeleton for a "vigía" – a lightweight monitoring node.
 * This file demonstrates the minimal interface expected by motor‑evolutivo.
 */
export interface VigiaConfig {
  name: string;
  cron?: string; // optional cron expression for scheduled runs
  enabled?: boolean;
}

export class Vigia {
  private config: VigiaConfig;
  constructor(config: VigiaConfig) {
    this.config = { enabled: true, ...config };
  }

  async run(context: any = {}): Promise<void> {
    if (!this.config.enabled) return;
    // placeholder logic – extend with real monitoring code
    console.log(`🕵️‍♂️ Running vigía "${this.config.name}"`);
    // simulate async work
    await new Promise((res) => setTimeout(res, 100));
  }
}

// Export a helper factory for convenience
export const createVigia = (cfg: VigiaConfig) => new Vigia(cfg);
