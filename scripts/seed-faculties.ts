import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const FACULTIES = [
  {
    id: "etf",
    university: "Univerzitet u Beogradu",
    name: "Elektrotehnički fakultet",
    shortName: "ETF",
    examDuration: 180,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za ETF Beograd",
  },
  {
    id: "fon",
    university: "Univerzitet u Beogradu",
    name: "Fakultet organizacionih nauka",
    shortName: "FON",
    examDuration: 120,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za FON Beograd",
  },
  {
    id: "rgf",
    university: "Univerzitet u Beogradu",
    name: "Rudarsko-geološki fakultet",
    shortName: "RGF",
    examDuration: 120,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za RGF Beograd",
  },
  {
    id: "matf",
    university: "Univerzitet u Beogradu",
    name: "Matematički fakultet",
    shortName: "MATF",
    examDuration: 180,
    examNumProblems: 15,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za MATF Beograd",
  },
  {
    id: "masf",
    university: "Univerzitet u Beogradu",
    name: "Mašinski fakultet",
    shortName: "MAŠF",
    examDuration: 150,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za Mašinski fakultet Beograd",
  },
  {
    id: "grf",
    university: "Univerzitet u Beogradu",
    name: "Građevinski fakultet",
    shortName: "GRF",
    examDuration: 150,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za Građevinski fakultet Beograd",
  },
  {
    id: "tmf",
    university: "Univerzitet u Beogradu",
    name: "Tehnološko-metalurški fakultet",
    shortName: "TMF",
    examDuration: 120,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za TMF Beograd",
  },
  {
    id: "sf",
    university: "Univerzitet u Beogradu",
    name: "Saobraćajni fakultet",
    shortName: "SF",
    examDuration: 120,
    examNumProblems: 20,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za Saobraćajni fakultet Beograd",
  },
  {
    id: "ff",
    university: "Univerzitet u Beogradu",
    name: "Fizički fakultet",
    shortName: "FF",
    examDuration: 150,
    examNumProblems: 15,
    examNumOptions: 5,
    scoringCorrect: "1.0",
    scoringWrong: "0.0",
    scoringBlank: "0.0",
    description: "Prijemni ispit iz matematike za Fizički fakultet Beograd",
  },
];

async function main() {
  console.log("Seeding faculties...");

  for (const f of FACULTIES) {
    await db
      .insert(schema.faculties)
      .values(f)
      .onConflictDoUpdate({
        target: schema.faculties.id,
        set: {
          name: f.name,
          shortName: f.shortName,
          examDuration: f.examDuration,
          examNumProblems: f.examNumProblems,
        },
      });
    console.log(`  ✓ ${f.shortName}`);
  }

  console.log("Done!");
}

main().catch(console.error);
