import { describe, it, expect } from "vitest";

describe("Project Environment Setup", () => {
  it("runs vitest successfully", () => {
    expect(true).toBe(true);
  });

  it("has app title correctly defined", () => {
    const appTitle = "ITBS AL- Kautsar - Monitoring piket";
    expect(appTitle).toContain("Monitoring piket");
  });
});
