import { db } from "@/lib/db";
import { faculties } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.select().from(faculties);
  return NextResponse.json(result);
}
