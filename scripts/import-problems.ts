import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Map from directory faculty slug to our faculty ID
const FACULTY_MAP: Record<string, string> = {
  elektrotehnicki_fakultet: "etf",
  fakultet_organizacionih_nauka: "fon",
  rudarsko_geoloski_fakultet: "rgf",
  matematicki_fakultet: "matf",
  masinski_fakultet: "masf",
  gradevinski_fakultet: "grf",
  tehnolosko_metalurski_fakultet: "tmf",
  saobracajni_fakultet: "sf",
  fizicki_fakultet: "ff",
};

interface ProblemMeta {
  document: string;
  order: number;
  solution_path: string;
  category: string | null;
  difficulty: number | null;
}

function parseFolderName(folderName: string): { facultySlug: string; year: number; extra: string } | null {
  // Pattern: univerzitet_u_beogradu_{faculty}_{year}[_extra]
  const match = folderName.match(/^univerzitet_u_beogradu_(.+?)_(\d{4})(.*)$/);
  if (!match) return null;

  return {
    facultySlug: match[1],
    year: parseInt(match[2]),
    extra: match[3] || "",
  };
}

function parseFilename(filename: string): { problemNumber: number } | null {
  const match = filename.match(/problem_(\d+)_solution\.html$/);
  if (!match) return null;
  return { problemNumber: parseInt(match[1]) };
}

function extractFromHtml(htmlContent: string) {
  const $ = cheerio.load(htmlContent);

  // Title
  const title = $("title").text().trim() || "Zadatak";

  // Correct answer from .answer-chip.correct or .correct-answer
  let correctAnswer = "";
  const correctChip = $(".answer-chip.correct").first().text().trim();
  if (correctChip) {
    const letterMatch = correctChip.match(/\(([A-Z])\)/);
    correctAnswer = letterMatch ? letterMatch[1] : correctChip.charAt(1);
  }
  if (!correctAnswer) {
    const correctEl = $(".correct-answer").first().text().trim();
    if (correctEl) {
      const letterMatch = correctEl.match(/\(([A-Z])\)/);
      correctAnswer = letterMatch ? letterMatch[1] : "";
    }
  }

  // Answer options from .answer-option with data-option
  const answerOptions: string[] = [];
  $(".answer-option[data-option]").each((_, el) => {
    const value = $(el).find(".value").text().trim();
    const label = $(el).attr("data-option") || "";
    answerOptions.push(`(${label}) ${value}`);
  });

  // Fallback: get from .answer-chip elements
  if (answerOptions.length === 0) {
    $(".answer-chip").each((_, el) => {
      answerOptions.push($(el).text().trim());
    });
  }

  // If still no correct answer, try to get from answer-chip.correct
  if (!correctAnswer && answerOptions.length > 0) {
    for (const opt of answerOptions) {
      // The correct answer chip would have been detected above
    }
    // Default to first option letter
    correctAnswer = "A";
  }

  // Logic scratchpad
  const logicScratchpad = $("#logic-scratchpad").text().trim() || null;

  // Problem text: extract from .problem-statement card
  let problemText = "";
  const problemStatement = $(".problem-statement").first();
  if (problemStatement.length) {
    problemText = problemStatement.text().replace(/\s+/g, " ").trim().slice(0, 2000);
  }

  return {
    title,
    correctAnswer: correctAnswer || "A",
    answerOptions,
    logicScratchpad,
    problemText,
  };
}

async function main() {
  const problemsDir = path.join(process.cwd(), "problems");
  const dbPath = path.join(process.cwd(), "database", "problems.json");

  // Load problem metadata from database/problems.json
  let problemsMeta: ProblemMeta[] = [];
  if (fs.existsSync(dbPath)) {
    problemsMeta = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }

  // Build lookup: solution_path -> metadata
  const metaLookup = new Map<string, ProblemMeta>();
  for (const pm of problemsMeta) {
    metaLookup.set(pm.solution_path, pm);
  }

  const folders = fs.readdirSync(problemsDir).filter((f) =>
    fs.statSync(path.join(problemsDir, f)).isDirectory()
  );

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const folder of folders) {
    const parsed = parseFolderName(folder);
    if (!parsed) {
      console.log(`  ⚠ Skipping unrecognized folder: ${folder}`);
      skipped++;
      continue;
    }

    const facultyId = FACULTY_MAP[parsed.facultySlug];
    if (!facultyId) {
      console.log(`  ⚠ Unknown faculty slug: ${parsed.facultySlug}`);
      skipped++;
      continue;
    }

    const folderPath = path.join(problemsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".html"));

    for (const file of files) {
      const fileParsed = parseFilename(file);
      if (!fileParsed) continue;

      const filePath = path.join(folderPath, file);
      const htmlContent = fs.readFileSync(filePath, "utf-8");

      try {
        const extracted = extractFromHtml(htmlContent);
        const slug = `${facultyId}-${parsed.year}-zadatak-${fileParsed.problemNumber}${parsed.extra ? "-" + parsed.extra.replace(/^_/, "") : ""}`;

        // Look up metadata
        const solutionPath = `problems/${folder}/${file}`;
        const meta = metaLookup.get(solutionPath);

        // Check if exists
        const existing = await db
          .select({ id: schema.problems.id })
          .from(schema.problems)
          .where(eq(schema.problems.slug, slug))
          .limit(1);

        if (existing.length > 0) {
          // Update
          await db.update(schema.problems).set({
            htmlContent,
            title: extracted.title,
            correctAnswer: extracted.correctAnswer,
            answerOptions: extracted.answerOptions,
            logicScratchpad: extracted.logicScratchpad,
            problemText: extracted.problemText,
            difficulty: meta?.difficulty?.toFixed(1) || null,
            updatedAt: new Date(),
          }).where(eq(schema.problems.id, existing[0].id));

          // Update topic if we have metadata
          if (meta?.category) {
            await db.delete(schema.problemTopics).where(eq(schema.problemTopics.problemId, existing[0].id));
            await db.insert(schema.problemTopics).values({
              problemId: existing[0].id,
              topicId: meta.category,
            }).onConflictDoNothing();
          }
        } else {
          // Insert
          const [inserted] = await db.insert(schema.problems).values({
            facultyId,
            year: parsed.year,
            problemNumber: fileParsed.problemNumber,
            title: extracted.title,
            htmlContent,
            problemText: extracted.problemText,
            correctAnswer: extracted.correctAnswer,
            answerOptions: extracted.answerOptions,
            numOptions: extracted.answerOptions.length || 5,
            logicScratchpad: extracted.logicScratchpad,
            slug,
            difficulty: meta?.difficulty?.toFixed(1) || null,
            isPublished: true,
          }).returning();

          // Add topic
          if (meta?.category) {
            await db.insert(schema.problemTopics).values({
              problemId: inserted.id,
              topicId: meta.category,
            }).onConflictDoNothing();
          }
        }

        imported++;
        if (imported % 50 === 0) console.log(`  Imported ${imported} problems...`);
      } catch (err: any) {
        console.error(`  ✗ Error processing ${file}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
