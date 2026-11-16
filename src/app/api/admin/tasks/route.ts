import { NextResponse } from "next/server";
import { getTasksByArea, saveTask, deleteTask } from "@/lib/db";
import { validateAdminPin } from "@/lib/auth";

export async function GET() {
  try {
    const areas = getTasksByArea();
    return NextResponse.json({ areas });
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
    const { id, areaId, text, displayOrder, active } = body;

    if (!areaId || !text) {
      return NextResponse.json({ error: "areaId and text are required" }, { status: 400 });
    }

    saveTask({
      id: id ? Number(id) : undefined,
      areaId: Number(areaId),
      text: String(text),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 99,
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!validateAdminPin(request)) {
      return NextResponse.json({ error: "Unauthorized: PIN admin tidak valid" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task id is required" }, { status: 400 });
    }

    deleteTask(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
