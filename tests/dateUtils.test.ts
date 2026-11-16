import { describe, it, expect } from "vitest";
import { getJakartaDate, isPastCutoff } from "@/lib/dateUtils";

describe("dateUtils (Asia/Jakarta timezone)", () => {
  it("converts UTC time to correct WIB date and day index across midnight boundary", () => {
    // 2026-11-16 18:00:00 UTC is 2026-11-17 01:00:00 WIB (Next day: Tuesday)
    const utcDate = new Date("2026-11-16T18:00:00Z");
    const result = getJakartaDate(utcDate);

    expect(result.dateString).toBe("2026-11-17");
    expect(result.dayIndex).toBe(2); // Tuesday
    expect(result.dayName).toBe("Selasa");
    expect(result.formattedTime).toBe("01:00");
  });

  it("formats Indonesian date string correctly", () => {
    const utcDate = new Date("2026-11-16T03:00:00Z"); // 10:00 WIB
    const result = getJakartaDate(utcDate);

    expect(result.dateString).toBe("2026-11-16");
    expect(result.dayIndex).toBe(1); // Monday
    expect(result.dayName).toBe("Senin");
    expect(result.formattedDate).toBe("Senin, 16 November 2026");
  });

  it("checks whether current Jakarta time is past cutoff time (default 20:00)", () => {
    // 19:30 WIB (12:30 UTC) -> should be FALSE
    const beforeCutoff = new Date("2026-11-16T12:30:00Z");
    expect(isPastCutoff("20:00", beforeCutoff)).toBe(false);

    // 20:01 WIB (13:01 UTC) -> should be TRUE
    const afterCutoff = new Date("2026-11-16T13:01:00Z");
    expect(isPastCutoff("20:00", afterCutoff)).toBe(true);

    // 20:00 WIB exactly (13:00 UTC) -> should be TRUE (at or past)
    const atCutoff = new Date("2026-11-16T13:00:00Z");
    expect(isPastCutoff("20:00", atCutoff)).toBe(true);
  });
});
