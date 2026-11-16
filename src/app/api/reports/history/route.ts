import { NextResponse } from "next/server";
import { getDailyReportsHistory, getOrCreateDailyData } from "@/lib/db";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";

export async function GET(_request?: Request) {
  try {
    const list = getDailyReportsHistory(30);

    const history = list.map((item) => {
      const dailyData = getOrCreateDailyData(item.date);

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
      const allTasks = dailyData.areas.flatMap((a) => a.tasks);
      const completedTasks = allTasks.filter((t) => t.completed).length;

      return {
        date: item.date,
        isSent: item.isSent,
        sentAt: item.sentAt,
        totalTasks: allTasks.length,
        completedTasks,
        formattedReport,
        areas: dailyData.areas,
      };
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
