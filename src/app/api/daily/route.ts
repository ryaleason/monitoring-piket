import { NextResponse } from "next/server";
import { getOrCreateDailyData, getSettings, TASK_NUMERIC_TO_STRING_ID } from "@/lib/db";
import { getJakartaDate, isPastCutoff } from "@/lib/dateUtils";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";
import { parseSantriNames } from "@/lib/schedule";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const jakartaNow = getJakartaDate();
    const targetDate = dateParam || jakartaNow.dateString;

    const dailyData = getOrCreateDailyData(targetDate);
    const settings = getSettings();
    const cutoffTime = settings.reminder_cutoff_time || "20:00";

    // Build taskChecks map for frontend
    const taskChecks: Record<string, boolean> = {};
    dailyData.areas.forEach((area) => {
      area.tasks.forEach((t) => {
        const strId = TASK_NUMERIC_TO_STRING_ID[t.id];
        if (strId) {
          taskChecks[strId] = Boolean(t.completed);
        }
      });
    });

    const area1 = dailyData.areas.find((a) => a.id === 1);
    const area2 = dailyData.areas.find((a) => a.id === 2);
    const area3 = dailyData.areas.find((a) => a.id === 3);

    const dayRoster = {
      dapur: parseSantriNames(area1?.assigneeText || ""),
      lobby: parseSantriNames(area2?.assigneeText || ""),
    };
    const customMusalaAssignee = area3?.assigneeText || null;

    // Format WhatsApp text
    const areasForReport: AreaReportData[] = dailyData.areas.map((a) => ({
      areaNumber: a.displayOrder,
      areaName: a.name,
      assigneeText: a.assigneeText || "",
      tasks: a.tasks.map((t) => ({
        text: t.text,
        completed: Boolean(t.completed),
      })),
    }));

    const formattedReport = formatDailyReport(areasForReport);
    const isToday = targetDate === jakartaNow.dateString;
    const isCutoffExceeded = isToday ? isPastCutoff(cutoffTime) : false;

    return NextResponse.json({
      ...dailyData,
      taskChecks,
      dayRoster,
      customMusalaAssignee,
      cutoffTime,
      isCutoffExceeded,
      formattedReport,
      todayWib: jakartaNow,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
