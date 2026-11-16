import { NextResponse } from "next/server";
import { getOrCreateDailyData, getSettings } from "@/lib/db";
import { getJakartaDate, isPastCutoff } from "@/lib/dateUtils";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const jakartaNow = getJakartaDate();
    const targetDate = dateParam || jakartaNow.dateString;

    const dailyData = getOrCreateDailyData(targetDate);
    const settings = getSettings();
    const cutoffTime = settings.reminder_cutoff_time || "20:00";

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
      cutoffTime,
      isCutoffExceeded,
      formattedReport,
      todayWib: jakartaNow,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
