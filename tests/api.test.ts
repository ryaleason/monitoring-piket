import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initDb, closeDb } from "@/lib/db";
import { GET as getDaily } from "@/app/api/daily/route";
import { POST as postCheck } from "@/app/api/daily/check/route";
import { POST as postAssignee } from "@/app/api/daily/assignee/route";
import { POST as postStatus } from "@/app/api/daily/status/route";
import { POST as postAuth } from "@/app/api/admin/auth/route";
import { GET as getSettingsApi, POST as postSettingsApi } from "@/app/api/admin/settings/route";
import { POST as postScheduleApi } from "@/app/api/admin/schedule/route";
import { POST as postTaskApi, DELETE as deleteTaskApi } from "@/app/api/admin/tasks/route";

describe("API Routes", () => {
  beforeEach(() => {
    initDb(":memory:");
  });

  afterEach(() => {
    closeDb();
  });

  it("GET /api/daily returns daily data for given date with generated formatted report", async () => {
    const req = new Request("http://localhost/api/daily?date=2026-11-16");
    const res = await getDaily(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.date).toBe("2026-11-16");
    expect(data.areas).toHaveLength(3);
    expect(data.formattedReport).toContain("List Piket Asrama & Musala");
    expect(data.isCutoffExceeded).toBeDefined();
  });

  it("POST /api/daily/check updates task status", async () => {
    const getReq = new Request("http://localhost/api/daily?date=2026-11-16");
    const initialRes = await getDaily(getReq);
    const initialData = await initialRes.json();
    const taskId = initialData.areas[0].tasks[0].id;

    // Toggle single check
    const checkReq = new Request("http://localhost/api/daily/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-11-16",
        taskId,
        completed: true,
      }),
    });
    const checkRes = await postCheck(checkReq);
    expect(checkRes.status).toBe(200);

    // Verify change
    const updatedRes = await getDaily(getReq);
    const updatedData = await updatedRes.json();
    expect(updatedData.areas[0].tasks[0].completed).toBe(true);

    // Check all tasks in area
    const areaId = initialData.areas[0].id;
    const checkAllReq = new Request("http://localhost/api/daily/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-11-16",
        areaId,
        checkAll: true,
        completed: true,
      }),
    });
    const checkAllRes = await postCheck(checkAllReq);
    expect(checkAllRes.status).toBe(200);

    const allCheckedRes = await getDaily(getReq);
    const allCheckedData = await allCheckedRes.json();
    expect(allCheckedData.areas[0].tasks.every((t: any) => t.completed)).toBe(true);
  });

  it("POST /api/daily/assignee updates daily assignee name", async () => {
    const req = new Request("http://localhost/api/daily/assignee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-11-16",
        areaId: 1,
        assignee: "Santri Pengganti",
      }),
    });
    const res = await postAssignee(req);
    expect(res.status).toBe(200);

    const getReq = new Request("http://localhost/api/daily?date=2026-11-16");
    const dailyRes = await getDaily(getReq);
    const dailyData = await dailyRes.json();
    expect(dailyData.areas[0].assigneeText).toBe("Santri Pengganti");
  });

  it("POST /api/daily/status updates isSent status", async () => {
    const req = new Request("http://localhost/api/daily/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-11-16",
        isSent: true,
      }),
    });
    const res = await postStatus(req);
    expect(res.status).toBe(200);

    const getReq = new Request("http://localhost/api/daily?date=2026-11-16");
    const dailyRes = await getDaily(getReq);
    const dailyData = await dailyRes.json();
    expect(dailyData.isSent).toBe(true);
  });

  it("POST /api/daily/assignee supports roster object persistence", async () => {
    const req = new Request("http://localhost/api/daily/assignee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-11-17",
        roster: {
          dapur: ["Akyas", "Evan"],
          lobby: ["Hisyam", "Ega"],
        },
      }),
    });
    const res = await postAssignee(req);
    expect(res.status).toBe(200);

    const getReq = new Request("http://localhost/api/daily?date=2026-11-17");
    const dailyRes = await getDaily(getReq);
    const dailyData = await dailyRes.json();
    expect(dailyData.areas[0].assigneeText).toBe("Akyas & Evan");
    expect(dailyData.areas[1].assigneeText).toBe("Hisyam & Ega");
    expect(dailyData.dayRoster.dapur).toEqual(["Akyas", "Evan"]);
    expect(dailyData.dayRoster.lobby).toEqual(["Hisyam", "Ega"]);
  });

  it("rejection with 403 when modifying locked report (isSent=true)", async () => {
    const date = "2026-11-18";
    // First lock the report
    const lockReq = new Request("http://localhost/api/daily/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, isSent: true }),
    });
    await postStatus(lockReq);

    // Attempt to toggle check
    const checkReq = new Request("http://localhost/api/daily/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        taskId: "dapur-1",
        completed: true,
      }),
    });
    const checkRes = await postCheck(checkReq);
    expect(checkRes.status).toBe(403);
    const checkErr = await checkRes.json();
    expect(checkErr.error).toContain("terkunci");

    // Attempt to update assignee
    const assignReq = new Request("http://localhost/api/daily/assignee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        areaId: 1,
        assignee: "Siapapun",
      }),
    });
    const assignRes = await postAssignee(assignReq);
    expect(assignRes.status).toBe(403);
    const assignErr = await assignRes.json();
    expect(assignErr.error).toContain("terkunci");
  });

  it("POST /api/admin/auth validates PIN correctly", async () => {
    // Default PIN is 1234
    const validReq = new Request("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "1234" }),
    });
    const validRes = await postAuth(validReq);
    expect(validRes.status).toBe(200);
    const validData = await validRes.json();
    expect(validData.valid).toBe(true);

    const invalidReq = new Request("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "9999" }),
    });
    const invalidRes = await postAuth(invalidReq);
    expect(invalidRes.status).toBe(401);
    const invalidData = await invalidRes.json();
    expect(invalidData.valid).toBe(false);
  });

  it("GET /api/admin/settings does NOT leak admin_pin (Critical Fix 1)", async () => {
    const res = await getSettingsApi();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.settings).toBeDefined();
    expect(data.settings.admin_pin).toBeUndefined();
    expect(data.settings.reminder_cutoff_time).toBeDefined();
  });

  it("Admin mutation endpoints require valid x-admin-pin header (Critical Fix 2)", async () => {
    // 1. POST /api/admin/schedule without header
    const noAuthSchedReq = new Request("http://localhost/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule: [] }),
    });
    const noAuthSchedRes = await postScheduleApi(noAuthSchedReq);
    expect(noAuthSchedRes.status).toBe(401);

    // With valid header
    const authSchedReq = new Request("http://localhost/api/admin/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": "1234",
      },
      body: JSON.stringify({ schedule: [] }),
    });
    const authSchedRes = await postScheduleApi(authSchedReq);
    expect(authSchedRes.status).toBe(200);

    // 2. POST /api/admin/tasks without header
    const noAuthTaskReq = new Request("http://localhost/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areaId: 1, text: "Unauthorized task" }),
    });
    const noAuthTaskRes = await postTaskApi(noAuthTaskReq);
    expect(noAuthTaskRes.status).toBe(401);

    // 3. POST /api/admin/settings without header
    const noAuthSettingsReq = new Request("http://localhost/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "reminder_cutoff_time", value: "22:00" }),
    });
    const noAuthSettingsRes = await postSettingsApi(noAuthSettingsReq);
    expect(noAuthSettingsRes.status).toBe(401);
  });
});
