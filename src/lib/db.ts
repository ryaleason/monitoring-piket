import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { INITIAL_AREAS, INITIAL_SCHEDULE, INITIAL_SETTINGS } from "./seed";

let activeDb: DatabaseSync | null = null;

export interface TaskItem {
  id: number;
  areaId: number;
  text: string;
  displayOrder: number;
  active: boolean;
  completed?: boolean;
}

export interface AreaWithTasks {
  id: number;
  name: string;
  displayOrder: number;
  assigneeText?: string;
  tasks: TaskItem[];
}

export interface DailyData {
  date: string;
  isSent: boolean;
  sentAt: string | null;
  areas: AreaWithTasks[];
}

export interface WeeklyScheduleItem {
  id: number;
  dayOfWeek: number;
  areaId: number;
  assignee: string;
}

const DEFAULT_DB_PATH =
  process.env.DATABASE_PATH ||
  (process.env.VERCEL ? "/tmp/piket.db" : "./data/piket.db");

export function initDb(dbPath: string = DEFAULT_DB_PATH): DatabaseSync {
  if (activeDb) {
    return activeDb;
  }

  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL and foreign keys
  db.exec("PRAGMA foreign_keys = ON;");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      display_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weekly_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL, -- 0: Minggu ... 6: Sabtu
      area_id INTEGER NOT NULL,
      assignee TEXT NOT NULL,
      UNIQUE(day_of_week, area_id),
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
      is_sent INTEGER NOT NULL DEFAULT 0,
      sent_at TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      area_id INTEGER NOT NULL,
      assignee TEXT NOT NULL,
      UNIQUE(date, area_id),
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_task_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      task_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      UNIQUE(date, task_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Seed default settings if empty
  const countSettingsStmt = db.prepare("SELECT COUNT(*) as count FROM settings");
  const settingsCount = (countSettingsStmt.get() as { count: number }).count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(INITIAL_SETTINGS)) {
      insertSetting.run(key, value);
    }
  }

  // Seed areas and tasks if empty
  const countAreasStmt = db.prepare("SELECT COUNT(*) as count FROM areas");
  const areasCount = (countAreasStmt.get() as { count: number }).count;
  if (areasCount === 0) {
    const insertArea = db.prepare("INSERT INTO areas (id, name, display_order) VALUES (?, ?, ?)");
    const insertTask = db.prepare(
      "INSERT INTO tasks (area_id, text, display_order, active) VALUES (?, ?, ?, 1)"
    );

    for (const area of INITIAL_AREAS) {
      insertArea.run(area.id, area.name, area.displayOrder);
      area.tasks.forEach((taskText, idx) => {
        insertTask.run(area.id, taskText, idx + 1);
      });
    }
  }

  // Seed weekly schedule if empty or if containing legacy placeholders
  const countSchedStmt = db.prepare("SELECT COUNT(*) as count FROM weekly_schedule");
  const schedCount = (countSchedStmt.get() as { count: number }).count;
  const hasPlaceholder = db
    .prepare(
      "SELECT 1 FROM weekly_schedule WHERE assignee = 'Zaid' OR assignee = 'Bilal' OR assignee LIKE '%Andi%' LIMIT 1"
    )
    .get();

  if (schedCount === 0 || Boolean(hasPlaceholder)) {
    const upsertSched = db.prepare(
      "INSERT INTO weekly_schedule (day_of_week, area_id, assignee) VALUES (?, ?, ?) ON CONFLICT(day_of_week, area_id) DO UPDATE SET assignee = excluded.assignee"
    );
    for (const item of INITIAL_SCHEDULE) {
      upsertSched.run(item.dayOfWeek, item.areaId, item.assignee);
    }
  }

  activeDb = db;
  return db;
}

export function getDb(): DatabaseSync {
  if (!activeDb) {
    return initDb();
  }
  return activeDb;
}

export function closeDb(): void {
  if (activeDb) {
    activeDb.close();
    activeDb = null;
  }
}

export function getTasksByArea(): AreaWithTasks[] {
  const db = getDb();
  const areasStmt = db.prepare("SELECT id, name, display_order FROM areas ORDER BY display_order ASC");
  const areasRows = areasStmt.all() as unknown as { id: number; name: string; display_order: number }[];

  const tasksStmt = db.prepare(
    "SELECT id, area_id, text, display_order, active FROM tasks WHERE active = 1 ORDER BY display_order ASC"
  );
  const tasksRows = tasksStmt.all() as unknown as {
    id: number;
    area_id: number;
    text: string;
    display_order: number;
    active: number;
  }[];

  return areasRows.map((a) => ({
    id: a.id,
    name: a.name,
    displayOrder: a.display_order,
    tasks: tasksRows
      .filter((t) => t.area_id === a.id)
      .map((t) => ({
        id: t.id,
        areaId: t.area_id,
        text: t.text,
        displayOrder: t.display_order,
        active: Boolean(t.active),
      })),
  }));
}

export function getOrCreateDailyData(dateStr: string): DailyData {
  const db = getDb();

  // 1. Ensure daily_reports row exists
  const reportStmt = db.prepare("SELECT is_sent, sent_at FROM daily_reports WHERE date = ?");
  let reportRow = reportStmt.get(dateStr) as { is_sent: number; sent_at: string | null } | undefined;

  if (!reportRow) {
    db.prepare("INSERT OR IGNORE INTO daily_reports (date, is_sent) VALUES (?, 0)").run(dateStr);
    reportRow = reportStmt.get(dateStr) as { is_sent: number; sent_at: string | null };
  }

  // Determine day of week in Jakarta timezone for dateStr
  const [year, month, day] = dateStr.split("-").map((v) => parseInt(v, 10));
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = dateObj.getUTCDay();

  // 2. Ensure daily_assignments exist (copied from weekly_schedule if missing)
  const areas = getTasksByArea();
  const assignStmt = db.prepare("SELECT area_id, assignee FROM daily_assignments WHERE date = ?");
  let assignRows = assignStmt.all(dateStr) as unknown as { area_id: number; assignee: string }[];

  if (assignRows.length === 0) {
    const weeklyStmt = db.prepare(
      "SELECT area_id, assignee FROM weekly_schedule WHERE day_of_week = ?"
    );
    const weeklyRows = weeklyStmt.all(dayOfWeek) as unknown as { area_id: number; assignee: string }[];
    const insertAssign = db.prepare(
      "INSERT OR IGNORE INTO daily_assignments (date, area_id, assignee) VALUES (?, ?, ?)"
    );

    for (const area of areas) {
      const match = weeklyRows.find((w) => w.area_id === area.id);
      const assigneeName = match ? match.assignee : "Petugas Piket";
      insertAssign.run(dateStr, area.id, assigneeName);
    }

    assignRows = assignStmt.all(dateStr) as unknown as { area_id: number; assignee: string }[];
  } else if (
    !Boolean(reportRow?.is_sent) &&
    assignRows.some(
      (a) =>
        a.assignee === "Zaid" ||
        a.assignee === "Ahmad" ||
        a.assignee === "Bilal" ||
        a.assignee.includes("Andi")
    )
  ) {
    // Refresh legacy placeholder assignments with official schedule
    const weeklyStmt = db.prepare(
      "SELECT area_id, assignee FROM weekly_schedule WHERE day_of_week = ?"
    );
    const weeklyRows = weeklyStmt.all(dayOfWeek) as unknown as { area_id: number; assignee: string }[];
    const updateAssign = db.prepare(
      "INSERT INTO daily_assignments (date, area_id, assignee) VALUES (?, ?, ?) ON CONFLICT(date, area_id) DO UPDATE SET assignee = excluded.assignee"
    );

    for (const area of areas) {
      const match = weeklyRows.find((w) => w.area_id === area.id);
      if (match) {
        updateAssign.run(dateStr, area.id, match.assignee);
      }
    }
    assignRows = assignStmt.all(dateStr) as unknown as { area_id: number; assignee: string }[];
  }

  // 3. Ensure daily_task_checks exist
  const checksStmt = db.prepare("SELECT task_id, completed FROM daily_task_checks WHERE date = ?");
  let checkRows = checksStmt.all(dateStr) as unknown as { task_id: number; completed: number }[];

  const existingTaskIds = new Set(checkRows.map((c) => c.task_id));
  const insertCheck = db.prepare(
    "INSERT OR IGNORE INTO daily_task_checks (date, task_id, completed) VALUES (?, ?, 0)"
  );

  let newCheckNeeded = false;
  for (const area of areas) {
    for (const task of area.tasks) {
      if (!existingTaskIds.has(task.id)) {
        insertCheck.run(dateStr, task.id);
        newCheckNeeded = true;
      }
    }
  }

  if (newCheckNeeded) {
    checkRows = checksStmt.all(dateStr) as { task_id: number; completed: number }[];
  }

  const checkMap = new Map<number, boolean>();
  for (const r of checkRows) {
    checkMap.set(r.task_id, Boolean(r.completed));
  }

  const assignMap = new Map<number, string>();
  for (const a of assignRows) {
    assignMap.set(a.area_id, a.assignee);
  }

  const enrichedAreas = areas.map((area) => ({
    ...area,
    assigneeText: assignMap.get(area.id) || "",
    tasks: area.tasks.map((task) => ({
      ...task,
      completed: checkMap.get(task.id) ?? false,
    })),
  }));

  return {
    date: dateStr,
    isSent: Boolean(reportRow?.is_sent),
    sentAt: reportRow?.sent_at || null,
    areas: enrichedAreas,
  };
}

export const TASK_STRING_TO_NUMERIC_ID: Record<string, number> = {
  "dapur-1": 1,
  "dapur-2": 2,
  "dapur-3": 3,
  "dapur-4": 4,
  "dapur-5": 5,
  "dapur-6": 6,
  "lobby-1": 7,
  "lobby-2": 8,
  "lobby-3": 9,
  "lobby-4": 10,
  "lobby-5": 11,
  "lobby-6": 12,
  "lobby-7": 13,
  "lobby-8": 14,
  "musala-1": 15,
  "musala-2": 16,
  "musala-3": 17,
  "musala-4": 18,
  "musala-5": 19,
  "musala-6": 20,
  "musala-7": 21,
};

export const TASK_NUMERIC_TO_STRING_ID: Record<number, string> = {
  1: "dapur-1",
  2: "dapur-2",
  3: "dapur-3",
  4: "dapur-4",
  5: "dapur-5",
  6: "dapur-6",
  7: "lobby-1",
  8: "lobby-2",
  9: "lobby-3",
  10: "lobby-4",
  11: "lobby-5",
  12: "lobby-6",
  13: "lobby-7",
  14: "lobby-8",
  15: "musala-1",
  16: "musala-2",
  17: "musala-3",
  18: "musala-4",
  19: "musala-5",
  20: "musala-6",
  21: "musala-7",
};

export function isReportLocked(dateStr: string): boolean {
  const db = getDb();
  const stmt = db.prepare("SELECT is_sent FROM daily_reports WHERE date = ?");
  const row = stmt.get(dateStr) as { is_sent: number } | undefined;
  return Boolean(row?.is_sent === 1);
}

export function toggleTaskCheck(dateStr: string, taskId: number | string, completed: boolean): void {
  const db = getDb();
  if (isReportLocked(dateStr)) {
    throw new Error("Laporan untuk tanggal ini sudah terkirim ke WhatsApp dan terkunci.");
  }

  const numericId =
    typeof taskId === "string"
      ? TASK_STRING_TO_NUMERIC_ID[taskId] || parseInt(taskId.replace(/\D/g, ""), 10) || 1
      : taskId;

  db.prepare(`
    INSERT INTO daily_task_checks (date, task_id, completed)
    VALUES (?, ?, ?)
    ON CONFLICT(date, task_id) DO UPDATE SET completed = excluded.completed
  `).run(dateStr, numericId, completed ? 1 : 0);
}

export function checkAllTasks(dateStr: string, areaId: number, completed: boolean): void {
  const db = getDb();
  if (isReportLocked(dateStr)) {
    throw new Error("Laporan untuk tanggal ini sudah terkirim ke WhatsApp dan terkunci.");
  }

  // Ensure daily data is initialized
  getOrCreateDailyData(dateStr);

  const tasksStmt = db.prepare("SELECT id FROM tasks WHERE area_id = ? AND active = 1");
  const taskRows = tasksStmt.all(areaId) as unknown as { id: number }[];

  const updateStmt = db.prepare(`
    INSERT INTO daily_task_checks (date, task_id, completed)
    VALUES (?, ?, ?)
    ON CONFLICT(date, task_id) DO UPDATE SET completed = excluded.completed
  `);

  for (const t of taskRows) {
    updateStmt.run(dateStr, t.id, completed ? 1 : 0);
  }
}

export function updateDailyAssignee(dateStr: string, areaId: number, assignee: string): void {
  const db = getDb();
  if (isReportLocked(dateStr)) {
    throw new Error("Laporan untuk tanggal ini sudah terkirim ke WhatsApp dan terkunci.");
  }

  // Ensure daily report is initialized
  getOrCreateDailyData(dateStr);

  db.prepare(`
    INSERT INTO daily_assignments (date, area_id, assignee)
    VALUES (?, ?, ?)
    ON CONFLICT(date, area_id) DO UPDATE SET assignee = excluded.assignee
  `).run(dateStr, areaId, assignee.trim());
}

export function setReportSentStatus(dateStr: string, isSent: boolean): void {
  const db = getDb();
  const sentAt = isSent ? new Date().toISOString() : null;

  db.prepare(`
    INSERT INTO daily_reports (date, is_sent, sent_at)
    VALUES (?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET is_sent = excluded.is_sent, sent_at = excluded.sent_at
  `).run(dateStr, isSent ? 1 : 0, sentAt);
}

export function getWeeklySchedule(): WeeklyScheduleItem[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT id, day_of_week as dayOfWeek, area_id as areaId, assignee FROM weekly_schedule ORDER BY day_of_week ASC, area_id ASC"
  );
  return stmt.all() as unknown as WeeklyScheduleItem[];
}

export function updateWeeklySchedule(schedule: { dayOfWeek: number; areaId: number; assignee: string }[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO weekly_schedule (day_of_week, area_id, assignee)
    VALUES (?, ?, ?)
    ON CONFLICT(day_of_week, area_id) DO UPDATE SET assignee = excluded.assignee
  `);

  for (const item of schedule) {
    stmt.run(item.dayOfWeek, item.areaId, item.assignee.trim());
  }
}

export function saveTask(task: { id?: number; areaId: number; text: string; displayOrder: number; active: boolean }): void {
  const db = getDb();
  if (task.id) {
    db.prepare(`
      UPDATE tasks
      SET area_id = ?, text = ?, display_order = ?, active = ?
      WHERE id = ?
    `).run(task.areaId, task.text.trim(), task.displayOrder, task.active ? 1 : 0, task.id);
  } else {
    db.prepare(`
      INSERT INTO tasks (area_id, text, display_order, active)
      VALUES (?, ?, ?, ?)
    `).run(task.areaId, task.text.trim(), task.displayOrder, task.active ? 1 : 0);
  }
}

export function deleteTask(taskId: number): void {
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
}

export function getSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as unknown as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export function updateSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value.trim());
}

export function getDailyReportsHistory(limit: number = 30): { date: string; isSent: boolean; sentAt: string | null }[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT date, is_sent, sent_at FROM daily_reports ORDER BY date DESC LIMIT ?"
  ).all(limit) as unknown as { date: string; is_sent: number; sent_at: string | null }[];

  return rows.map((r) => ({
    date: r.date,
    isSent: Boolean(r.is_sent),
    sentAt: r.sent_at,
  }));
}
