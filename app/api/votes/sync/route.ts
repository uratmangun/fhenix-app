import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: false, message: "Vote index sync is disabled in local development." }, { status: 410 });
}
