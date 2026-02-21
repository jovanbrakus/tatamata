import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import fs from "fs";
import path from "path";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const categoriesPath = path.join(process.cwd(), "database", "categories.json");
  const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));

  console.log("Seeding topics...");

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    await db
      .insert(schema.topics)
      .values({
        id: cat.id,
        name: cat.sr,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: schema.topics.id,
        set: { name: cat.sr, sortOrder: i },
      });
    console.log(`  ✓ ${cat.sr}`);
  }

  console.log("Done!");
}

main().catch(console.error);
