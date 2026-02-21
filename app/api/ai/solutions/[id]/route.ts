import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSolutions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;

  const result = await db.select().from(aiSolutions)
    .where(and(eq(aiSolutions.id, id), eq(aiSolutions.userId, userId)))
    .limit(1);

  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...result[0], htmlContent: undefined });
}
