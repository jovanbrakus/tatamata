import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { targetFaculties } = await req.json();

  if (!Array.isArray(targetFaculties) || targetFaculties.length === 0 || targetFaculties.length > 4) {
    return NextResponse.json({ error: "Izaberi 1-3 fakulteta." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ targetFaculties, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return NextResponse.json({ ok: true, targetFaculties });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const [user] = await db.select({ targetFaculties: users.targetFaculties }).from(users).where(eq(users.id, userId)).limit(1);

  return NextResponse.json({ targetFaculties: user?.targetFaculties || [] });
}
