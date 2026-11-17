import { NextResponse } from "next/server";
import { updateDailyAssignee, isReportLocked } from "@/lib/db";
import { formatSantriNames } from "@/lib/schedule";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, areaId, assignee, roster } = body;

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    if (isReportLocked(date)) {
      return NextResponse.json(
        { error: "Laporan untuk tanggal ini sudah terkirim ke WhatsApp dan terkunci." },
        { status: 403 }
      );
    }

    if (roster && typeof roster === "object") {
      if (roster.dapur !== undefined) {
        const text = Array.isArray(roster.dapur)
          ? formatSantriNames(roster.dapur)
          : String(roster.dapur);
        updateDailyAssignee(date, 1, text);
      }
      if (roster.lobby !== undefined) {
        const text = Array.isArray(roster.lobby)
          ? formatSantriNames(roster.lobby)
          : String(roster.lobby);
        updateDailyAssignee(date, 2, text);
      }
      if (roster.musala !== undefined) {
        const text = Array.isArray(roster.musala)
          ? formatSantriNames(roster.musala)
          : String(roster.musala);
        updateDailyAssignee(date, 3, text);
      }
      return NextResponse.json({ success: true, date, roster });
    }

    if (areaId !== undefined && assignee !== undefined) {
      updateDailyAssignee(date, Number(areaId), String(assignee));
      return NextResponse.json({ success: true, date, areaId, assignee });
    }

    return NextResponse.json({ error: "roster or (areaId and assignee) is required" }, { status: 400 });
  } catch (error: any) {
    const status = error.message?.includes("terkunci") ? 403 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
