import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    const settings = getSettings();
    const currentPin = settings.admin_pin || process.env.ADMIN_PIN || "1234";

    if (String(pin).trim() === currentPin.trim()) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false, error: "PIN salah" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
