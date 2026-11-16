import { NextResponse } from "next/server";
import { getSettings, updateSetting } from "@/lib/db";
import { validateAdminPin } from "@/lib/auth";

export async function GET() {
  try {
    const settings = getSettings();
    // NEVER leak admin_pin to public client
    const { admin_pin: _omitted, ...safeSettings } = settings;
    return NextResponse.json({ settings: safeSettings });
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
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    updateSetting(String(key), String(value));
    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
