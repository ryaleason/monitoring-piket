import { NextResponse } from "next/server";
import { setReportSentStatus } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, isSent } = body;

    if (!date || isSent === undefined) {
      return NextResponse.json({ error: "date and isSent are required" }, { status: 400 });
    }

    setReportSentStatus(date, Boolean(isSent));
    return NextResponse.json({ success: true, date, isSent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
