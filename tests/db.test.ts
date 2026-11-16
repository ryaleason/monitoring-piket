import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  initDb,
  getOrCreateDailyData,
  toggleTaskCheck,
  checkAllTasks,
  updateDailyAssignee,
  setReportSentStatus,
  getWeeklySchedule,
  updateWeeklySchedule,
  getTasksByArea,
  saveTask,
  deleteTask,
  getSettings,
  updateSetting,
  closeDb,
} from "@/lib/db";

describe("Database layer (node:sqlite)", () => {
  beforeEach(() => {
    // Initialize in-memory database for testing
    initDb(":memory:");
  });

  afterEach(() => {
    closeDb();
  });

  it("seeds default 3 areas and 21 tasks on initialization", () => {
    const areas = getTasksByArea();
    expect(areas).toHaveLength(3);

    expect(areas[0].name).toBe("Dapur");
    expect(areas[0].tasks).toHaveLength(6);

    expect(areas[1].name).toBe("Lobby, Ruang Belajar, Halaman & Ruang Asrama");
    expect(areas[1].tasks).toHaveLength(8);

    expect(areas[2].name).toBe("Musala & Kamar Mandi");
    expect(areas[2].tasks).toHaveLength(7);
  });

  it("creates daily report data initialized with weekly schedule assignees and uncompleted tasks", () => {
    const dateStr = "2026-11-16"; // Senin (Monday, dayIndex 1)
    const data = getOrCreateDailyData(dateStr);

    expect(data.date).toBe(dateStr);
    expect(data.isSent).toBe(false);
    expect(data.areas).toHaveLength(3);

    // Each area should have assignee and tasks
    expect(data.areas[0].assigneeText).toBeTruthy();
    expect(data.areas[0].tasks.every((t) => !t.completed)).toBe(true);

    // Calling it again should be idempotent and preserve existing status
    toggleTaskCheck(dateStr, data.areas[0].tasks[0].id, true);
    const dataAfterCheck = getOrCreateDailyData(dateStr);
    expect(dataAfterCheck.areas[0].tasks[0].completed).toBe(true);
  });

  it("allows checking all tasks in an area at once", () => {
    const dateStr = "2026-11-16";
    const data = getOrCreateDailyData(dateStr);
    const area1Id = data.areas[0].id;

    // Check all
    checkAllTasks(dateStr, area1Id, true);
    const updated = getOrCreateDailyData(dateStr);
    expect(updated.areas[0].tasks.every((t) => t.completed)).toBe(true);

    // Uncheck all
    checkAllTasks(dateStr, area1Id, false);
    const reset = getOrCreateDailyData(dateStr);
    expect(reset.areas[0].tasks.every((t) => !t.completed)).toBe(true);
  });

  it("editing daily assignee does NOT alter weekly schedule (Review Focus 3)", () => {
    const dateStr = "2026-11-16";
    const data = getOrCreateDailyData(dateStr);
    const areaId = data.areas[0].id;

    const originalWeekly = getWeeklySchedule();
    const originalWeeklyAssignee = originalWeekly.find(
      (s) => s.dayOfWeek === 1 && s.areaId === areaId
    )?.assignee;

    // Change daily assignee
    updateDailyAssignee(dateStr, areaId, "Pengganti Sementara");

    const updatedDaily = getOrCreateDailyData(dateStr);
    expect(updatedDaily.areas[0].assigneeText).toBe("Pengganti Sementara");

    // Verify weekly schedule was NOT touched
    const weeklyAfter = getWeeklySchedule();
    const weeklyAssigneeAfter = weeklyAfter.find(
      (s) => s.dayOfWeek === 1 && s.areaId === areaId
    )?.assignee;
    expect(weeklyAssigneeAfter).toBe(originalWeeklyAssignee);
  });

  it("updates report sent status and sent_at timestamp", () => {
    const dateStr = "2026-11-16";
    getOrCreateDailyData(dateStr);

    setReportSentStatus(dateStr, true);
    let data = getOrCreateDailyData(dateStr);
    expect(data.isSent).toBe(true);
    expect(data.sentAt).toBeTruthy();

    setReportSentStatus(dateStr, false);
    data = getOrCreateDailyData(dateStr);
    expect(data.isSent).toBe(false);
  });

  it("supports managing tasks (add, update, delete)", () => {
    const areas = getTasksByArea();
    const area1 = areas[0];

    // Add new task
    saveTask({
      areaId: area1.id,
      text: "Tugas Tambahan Dapur",
      displayOrder: 99,
      active: true,
    });

    let updatedAreas = getTasksByArea();
    const added = updatedAreas[0].tasks.find((t) => t.text === "Tugas Tambahan Dapur");
    expect(added).toBeDefined();

    // Edit task
    saveTask({
      id: added!.id,
      areaId: area1.id,
      text: "Tugas Tambahan Dapur (Revisi)",
      displayOrder: 99,
      active: true,
    });

    updatedAreas = getTasksByArea();
    expect(updatedAreas[0].tasks.some((t) => t.text === "Tugas Tambahan Dapur (Revisi)")).toBe(true);

    // Delete task
    deleteTask(added!.id);
    updatedAreas = getTasksByArea();
    expect(updatedAreas[0].tasks.some((t) => t.text === "Tugas Tambahan Dapur (Revisi)")).toBe(false);
  });

  it("manages settings like reminder cutoff time and admin pin", () => {
    const settings = getSettings();
    expect(settings.reminder_cutoff_time).toBe("20:00");
    expect(settings.admin_pin).toBe("1234");

    updateSetting("reminder_cutoff_time", "21:00");
    const updated = getSettings();
    expect(updated.reminder_cutoff_time).toBe("21:00");
  });
});
