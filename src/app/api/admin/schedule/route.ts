import { NextResponse } from "next/server";
import { getWeeklySchedule, updateWeeklySchedule } from "@/lib/db";
import { validateAdminPin } from "@/lib/auth";

export async function GET() {
  try {
    const schedule = getWeeklySchedule();
    return NextResponse.json({ schedule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!validateAdminPin(request)) {
      return NextResponse.json({ error: "Unauthorized: PIN admin tidak valid" }, { status: 401 });
    }

    const body = await request.json();
    const { schedule } = body;

    if (!Array.isArray(schedule)) {
      return NextResponse.json({ error: "Schedule array is required" }, { status: 400 });
    }

    updateWeeklySchedule(schedule);
    return NextResponse.json({ success: true, count: schedule.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
