import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ problemId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { problemId } = await params;
  const { answer, isCorrect } = await req.json();

  const status = isCorrect ? "solved" : "attempted";

  await db
    .insert(problemProgress)
    .values({
      userId,
      problemId,
      status,
      attempts: 1,
      lastAnswer: answer,
      isCorrect,
      solvedAt: isCorrect ? new Date() : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [problemProgress.userId, problemProgress.problemId],
      set: {
        status: isCorrect ? "solved" : sql`CASE WHEN ${problemProgress.status} = 'solved' THEN 'solved' ELSE 'attempted' END`,
        attempts: sql`${problemProgress.attempts} + 1`,
        lastAnswer: answer,
        isCorrect: isCorrect || sql`${problemProgress.isCorrect}`,
        solvedAt: isCorrect ? new Date() : sql`${problemProgress.solvedAt}`,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ status, isCorrect });
}
