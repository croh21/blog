import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await updateSettings(key, value);
    }
    const updated = await getSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
