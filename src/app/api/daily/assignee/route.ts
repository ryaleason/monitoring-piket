import { NextResponse } from "next/server";
import { updateDailyAssignee } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, areaId, assignee } = body;

    if (!date || !areaId || assignee === undefined) {
      return NextResponse.json({ error: "date, areaId, and assignee are required" }, { status: 400 });
    }

    updateDailyAssignee(date, Number(areaId), String(assignee));
    return NextResponse.json({ success: true, date, areaId, assignee });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
