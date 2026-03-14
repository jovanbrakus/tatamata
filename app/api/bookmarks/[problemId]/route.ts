import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ problemId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { problemId } = await params;

  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.problemId, problemId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.problemId, problemId)));
    return NextResponse.json({ bookmarked: false });
  } else {
    await db.insert(bookmarks).values({ userId, problemId });
    return NextResponse.json({ bookmarked: true });
  }
}
