import { auth } from "@/lib/auth";
import { checkAiRateLimit } from "@/lib/utils/rate-limit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { used, limit } = await checkAiRateLimit(userId);

  return NextResponse.json({ used, limit, remaining: limit - used });
}
