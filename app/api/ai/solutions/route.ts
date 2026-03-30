import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSolutions } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const result = await db
    .select({
      id: aiSolutions.id,
      title: aiSolutions.title,
      contextType: aiSolutions.contextType,
      createdAt: aiSolutions.createdAt,
    })
    .from(aiSolutions)
    .where(eq(aiSolutions.userId, userId))
    .orderBy(desc(aiSolutions.createdAt))
    .limit(50);

  return NextResponse.json(result);
}
