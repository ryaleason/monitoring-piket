import { NextResponse } from "next/server";
import { toggleTaskCheck, checkAllTasks } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, taskId, areaId, checkAll, completed } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (checkAll && areaId) {
      checkAllTasks(date, Number(areaId), Boolean(completed));
      return NextResponse.json({ success: true, areaId, completed });
    }

    if (taskId !== undefined) {
      toggleTaskCheck(date, Number(taskId), Boolean(completed));
      return NextResponse.json({ success: true, taskId, completed });
    }

    return NextResponse.json({ error: "taskId or (areaId and checkAll) is required" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
