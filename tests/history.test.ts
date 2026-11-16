import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initDb, closeDb, getOrCreateDailyData, setReportSentStatus } from "@/lib/db";
import { GET as getHistory } from "@/app/api/reports/history/route";

describe("History API", () => {
  beforeEach(() => {
    initDb(":memory:");
  });

  afterEach(() => {
    closeDb();
  });

  it("GET /api/reports/history returns list of reports with sent status and completion metrics", async () => {
    // Populate two dates
    const date1 = "2026-11-15";
    const date2 = "2026-11-16";

    getOrCreateDailyData(date1);
    setReportSentStatus(date1, true);

    getOrCreateDailyData(date2);
    setReportSentStatus(date2, false);

    const req = new Request("http://localhost/api/reports/history");
    const res = await getHistory(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.history).toBeDefined();
    expect(data.history.length).toBeGreaterThanOrEqual(2);

    const item1 = data.history.find((h: any) => h.date === date1);
    expect(item1).toBeDefined();
    expect(item1.isSent).toBe(true);
    expect(item1.formattedReport).toContain("List Piket Asrama & Musala");

    const item2 = data.history.find((h: any) => h.date === date2);
    expect(item2).toBeDefined();
    expect(item2.isSent).toBe(false);
  });
});
