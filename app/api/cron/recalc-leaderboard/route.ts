import { NextResponse } from "next/server";
import { recalculateLeaderboard } from "@/lib/leaderboard";

export async function GET(req: Request) {
  // Verify cron secret in production
  try {
    await recalculateLeaderboard();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
