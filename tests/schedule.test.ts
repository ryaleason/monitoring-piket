import { describe, it, expect } from "vitest";
import {
  FIXED_DAILY_SCHEDULE,
  DEFAULT_PIKET_AREAS,
  parseSantriNames,
  formatSantriNames,
  transferSantri,
} from "@/lib/schedule";

describe("Fixed Daily Schedule", () => {
  it("matches the printed schedule document for Monday to Saturday", () => {
    // Senin
    expect(FIXED_DAILY_SCHEDULE[1].musala).toBe("Ega & Rakha");
    expect(FIXED_DAILY_SCHEDULE[1].dapur).toBe("Gabrial");
    expect(FIXED_DAILY_SCHEDULE[1].lobby).toBe("Izal & Arman");

    // Selasa
    expect(FIXED_DAILY_SCHEDULE[2].musala).toBe("Yasir & Hanif");
    expect(FIXED_DAILY_SCHEDULE[2].dapur).toBe("Akyas");
    expect(FIXED_DAILY_SCHEDULE[2].lobby).toBe("Andi & Ega");

    // Rabu
    expect(FIXED_DAILY_SCHEDULE[3].musala).toBe("Gabrial & Izal");
    expect(FIXED_DAILY_SCHEDULE[3].dapur).toBe("Rakha");
    expect(FIXED_DAILY_SCHEDULE[3].lobby).toBe("Yasir & Hanif");

    // Kamis
    expect(FIXED_DAILY_SCHEDULE[4].musala).toBe("Akyas & Andi");
    expect(FIXED_DAILY_SCHEDULE[4].dapur).toBe("Arman");
    expect(FIXED_DAILY_SCHEDULE[4].lobby).toBe("Ashlah & Rakha");

    // Jumat
    expect(FIXED_DAILY_SCHEDULE[5].musala).toBe("Yasir & Hanif");
    expect(FIXED_DAILY_SCHEDULE[5].dapur).toBe("Gabrial");
    expect(FIXED_DAILY_SCHEDULE[5].lobby).toBe("Akyas & Andi");

    // Sabtu
    expect(FIXED_DAILY_SCHEDULE[6].musala).toBe("Evan & Arman");
    expect(FIXED_DAILY_SCHEDULE[6].dapur).toBe("Izal");
    expect(FIXED_DAILY_SCHEDULE[6].lobby).toBe("Ashlah & Ega");

    // Minggu
    expect(FIXED_DAILY_SCHEDULE[0].musala).toBe("Semua Santri");
  });

  it("has exactly 3 areas and 21 tasks", () => {
    expect(DEFAULT_PIKET_AREAS).toHaveLength(3);
    const totalTasks = DEFAULT_PIKET_AREAS.reduce((acc, a) => acc + a.tasks.length, 0);
    expect(totalTasks).toBe(21);
  });

  it("correctly parses santri names from string", () => {
    expect(parseSantriNames("Akyas")).toEqual(["Akyas"]);
    expect(parseSantriNames("Andi & Ega")).toEqual(["Andi", "Ega"]);
    expect(parseSantriNames("Gabrial, Izal & Arman")).toEqual(["Gabrial", "Izal", "Arman"]);
    expect(parseSantriNames("Semua Santri")).toEqual(["Semua Santri"]);
    expect(parseSantriNames("")).toEqual([]);
  });

  it("correctly formats santri names to natural string", () => {
    expect(formatSantriNames([])).toBe("Belum ditentukan");
    expect(formatSantriNames(["Akyas"])).toBe("Akyas");
    expect(formatSantriNames(["Akyas", "Andi"])).toBe("Akyas & Andi");
    expect(formatSantriNames(["Akyas", "Andi", "Ega"])).toBe("Akyas, Andi & Ega");
  });

  it("handles transferSantri between Dapur and Asrama", () => {
    // Selasa: Dapur = Akyas, Lobby = Andi & Ega
    const initial = {
      dapur: ["Akyas"],
      lobby: ["Andi", "Ega"],
    };

    // User taps + Andi in Dapur: Andi moves from lobby to dapur
    const step1 = transferSantri(initial, "Andi", "dapur");
    expect(step1.dapur).toEqual(["Akyas", "Andi"]);
    expect(step1.lobby).toEqual(["Ega"]);

    // Format matches user's request
    expect(formatSantriNames(step1.dapur)).toBe("Akyas & Andi");
    expect(formatSantriNames(step1.lobby)).toBe("Ega");

    // Returning Andi back to lobby
    const step2 = transferSantri(step1, "Andi", "lobby");
    expect(step2.dapur).toEqual(["Akyas"]);
    expect(step2.lobby).toEqual(["Ega", "Andi"]);
  });
});
