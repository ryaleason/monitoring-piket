import { describe, it, expect } from "vitest";
import { FIXED_DAILY_SCHEDULE, DEFAULT_PIKET_AREAS } from "@/lib/schedule";

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
});
