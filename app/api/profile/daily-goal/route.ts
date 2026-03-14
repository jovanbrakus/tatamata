import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { dailyGoal } = await req.json();

  if (typeof dailyGoal !== "number" || dailyGoal < 1 || dailyGoal > 50) {
    return NextResponse.json({ error: "Dnevni cilj mora biti između 1 i 50." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ dailyGoal, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return NextResponse.json({ ok: true, dailyGoal });
}
