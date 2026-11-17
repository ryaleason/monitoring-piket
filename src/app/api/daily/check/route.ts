import { NextResponse } from "next/server";
import { toggleTaskCheck, checkAllTasks, isReportLocked } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, taskId, areaId, checkAll, completed, checks } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (isReportLocked(date)) {
      return NextResponse.json(
        { error: "Laporan untuk tanggal ini sudah terkirim ke WhatsApp dan terkunci." },
        { status: 403 }
      );
    }

    if (checks && typeof checks === "object") {
      for (const [tId, isDone] of Object.entries(checks)) {
        toggleTaskCheck(date, tId, Boolean(isDone));
      }
      return NextResponse.json({ success: true, checks });
    }

    if (checkAll && areaId) {
      checkAllTasks(date, Number(areaId), Boolean(completed));
      return NextResponse.json({ success: true, areaId, completed });
    }

    if (taskId !== undefined) {
      toggleTaskCheck(date, taskId, Boolean(completed));
      return NextResponse.json({ success: true, taskId, completed });
    }

    return NextResponse.json({ error: "taskId or (areaId and checkAll) is required" }, { status: 400 });
  } catch (error: any) {
    const status = error.message?.includes("terkunci") ? 403 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
