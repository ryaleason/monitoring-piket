import { NextResponse } from "next/server";
import { getWeeklySchedule, updateWeeklySchedule } from "@/lib/db";

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
