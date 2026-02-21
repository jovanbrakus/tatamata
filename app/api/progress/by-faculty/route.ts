import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress, problems, faculties } from "@/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const result = await db.execute(sql`
    SELECT
      f.id as faculty_id,
      f.short_name,
      COUNT(DISTINCT p.id) as total,
      COUNT(DISTINCT CASE WHEN pp.status = 'solved' THEN p.id END) as solved
    FROM faculties f
    JOIN problems p ON p.faculty_id = f.id AND p.is_published = true
    LEFT JOIN problem_progress pp ON pp.problem_id = p.id AND pp.user_id = ${userId}
    GROUP BY f.id, f.short_name
    ORDER BY f.short_name
  `);

  return NextResponse.json(result.rows);
}
