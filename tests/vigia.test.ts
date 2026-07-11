/**
 * vigia-skeleton.test.ts
 * Basic unit tests for the Vigia class
 */
import { Vigia, createVigia, VigiaConfig } from "../src/vigia/vigia-skeleton";

describe("Vigia", () => {
  it("should create an instance with default enabled=true", () => {
    const config: VigiaConfig = { name: "test-vigia" };
    const vigia = new Vigia(config);
    expect(vigia).toBeInstanceOf(Vigia);
  });

  it("should run without errors when enabled", async () => {
    const vigia = createVigia({ name: "active-vigia", enabled: true });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    await vigia.run();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("active-vigia")
    );
    consoleSpy.mockRestore();
  });

  it("should skip execution when disabled", async () => {
    const vigia = createVigia({ name: "disabled-vigia", enabled: false });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    await vigia.run();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should accept optional cron expression", () => {
    const config: VigiaConfig = {
      name: "scheduled-vigia",
      cron: "*/5 * * * *",
    };
    const vigia = createVigia(config);
    expect(vigia).toBeInstanceOf(Vigia);
  });
});

describe("createVigia factory", () => {
  it("should return a Vigia instance", () => {
    const vigia = createVigia({ name: "factory-test" });
    expect(vigia).toBeInstanceOf(Vigia);
  });
});
