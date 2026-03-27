import { db } from "@/lib/db";
import { mockExams, users } from "@/drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getAllMeta, getCategoryGroups } from "@/lib/problems";

// --- Constants ---

const GROUP_WEIGHTS: Record<string, number> = {
  algebra: 0.30,
  trigonometry: 0.15,
  geometry: 0.15,
  analysis: 0.15,
  combinatorics_and_probability: 0.15,
};
const EXAM_WEIGHT = 0.10;
const WINDOW_SIZE = 10;
const MIN_ATTEMPTS = 3;
const PENALTY_GRACE_DAYS = 2;
const PENALTY_PER_DAY = 2;
const PENALTY_MAX = 20;
const DIFFICULTY_CEILING_THRESHOLD = 7;
const DIFFICULTY_CEILING_CAP = 80;
const DEFAULT_DIFFICULTY = 5;

// --- Types ---

export interface SubcategoryScore {
  score: number;
  accuracy: number;
  confidence: number;
  recentCorrect: number;
  recentTotal: number;
}

export interface GroupScore {
  score: number;
  weight: number;
  subcategories: Record<string, SubcategoryScore>;
}

export interface ReadinessBreakdown {
  finalScore: number;
  rawScore: number;
  inactivityPenalty: number;
  daysInactive: number;
  examScore: number;
  examCount: number;
  groupScores: Record<string, GroupScore>;
}

// --- Progress row type (from recalculateAnalytics shared query) ---

interface ProgressRow {
  problem_id: string;
  is_correct: boolean;
  updated_at: string | Date;
}

/**
 * Calculate the readiness score for a user.
 * Accepts pre-fetched progress rows to share data with recalculateAnalytics.
 */
export async function calculateReadinessScore(
  userId: string,
  progressRows: ProgressRow[]
): Promise<ReadinessBreakdown> {
  // 1. Build problemId → subcategory and problemId → difficulty maps
  const allProblems = getAllMeta();
  const idToSubcategory = new Map<string, string>();
  const idToDifficulty = new Map<string, number>();
  for (const p of allProblems) {
    if (p.category) idToSubcategory.set(p.id, p.category);
    if (p.difficulty) idToDifficulty.set(p.id, p.difficulty);
  }

  // 2. Build subcategory → group map and group → subcategories map
  const categoryGroups = getCategoryGroups();
  const subcategoryToGroup = new Map<string, string>();
  const groupSubcategories = new Map<string, string[]>();
  for (const group of categoryGroups) {
    groupSubcategories.set(group.id, group.categories);
    for (const cat of group.categories) {
      subcategoryToGroup.set(cat, group.id);
    }
  }

  // 3. Group progress rows by subcategory
  const bySubcategory = new Map<string, { problemId: string; isCorrect: boolean; updatedAt: number }[]>();
  for (const row of progressRows) {
    const subcategory = idToSubcategory.get(row.problem_id);
    if (!subcategory) continue;
    // Only include subcategories that belong to a known group
    if (!subcategoryToGroup.has(subcategory)) continue;

    if (!bySubcategory.has(subcategory)) bySubcategory.set(subcategory, []);
    bySubcategory.get(subcategory)!.push({
      problemId: row.problem_id,
      isCorrect: !!row.is_correct,
      updatedAt: new Date(row.updated_at).getTime(),
    });
  }

  // 4. Compute subcategory scores (sliding window + difficulty weighting)
  const subcategoryScores = new Map<string, SubcategoryScore>();

  for (const [subcategory, rows] of bySubcategory) {
    // Sort by updatedAt desc, take last WINDOW_SIZE
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    const recent = rows.slice(0, WINDOW_SIZE);
    const recentTotal = recent.length;

    // Difficulty-weighted accuracy: harder problems count more
    let weightedCorrect = 0;
    let weightedTotal = 0;
    let maxCorrectDifficulty = 0;
    let recentCorrect = 0;
    for (const r of recent) {
      const diff = idToDifficulty.get(r.problemId) ?? DEFAULT_DIFFICULTY;
      weightedTotal += diff;
      if (r.isCorrect) {
        weightedCorrect += diff;
        recentCorrect++;
        if (diff > maxCorrectDifficulty) maxCorrectDifficulty = diff;
      }
    }
    const accuracy = weightedTotal > 0 ? (weightedCorrect / weightedTotal) * 100 : 0;
    const confidence = Math.min(1, recentTotal / MIN_ATTEMPTS);

    // Difficulty ceiling: capped at 80 unless a problem with difficulty > 7 was solved correctly
    const ceiling = maxCorrectDifficulty > DIFFICULTY_CEILING_THRESHOLD ? 100 : DIFFICULTY_CEILING_CAP;
    const score = Math.min(ceiling, Math.round(accuracy * confidence * 100) / 100);

    subcategoryScores.set(subcategory, {
      score,
      accuracy: Math.round(accuracy * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      recentCorrect,
      recentTotal,
    });
  }

  // 5. Compute group scores
  const groupScores: Record<string, GroupScore> = {};

  for (const group of categoryGroups) {
    const weight = GROUP_WEIGHTS[group.id] ?? 0;
    const subs: Record<string, SubcategoryScore> = {};
    let sumScores = 0;

    for (const subcategory of group.categories) {
      const subScore = subcategoryScores.get(subcategory) ?? {
        score: 0,
        accuracy: 0,
        confidence: 0,
        recentCorrect: 0,
        recentTotal: 0,
      };
      subs[subcategory] = subScore;
      sumScores += subScore.score;
    }

    const groupScore = group.categories.length > 0
      ? Math.round((sumScores / group.categories.length) * 100) / 100
      : 0;

    groupScores[group.id] = { score: groupScore, weight, subcategories: subs };
  }

  // 6. Exam simulation score (last 5 completed exams, all faculties)
  const examRows = await db
    .select({ scorePercent: mockExams.scorePercent })
    .from(mockExams)
    .where(and(eq(mockExams.userId, userId), eq(mockExams.status, "completed")))
    .orderBy(desc(mockExams.finishedAt))
    .limit(5);

  const examCount = examRows.length;
  const examScore = examCount > 0
    ? examRows.reduce((sum, e) => sum + Number(e.scorePercent ?? 0), 0) / examCount
    : 0;

  // 7. Inactivity penalty
  const userRows = await db
    .select({ lastActiveDate: users.lastActiveDate })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  let daysInactive = 0;
  let inactivityPenalty = 0;

  if (userRows.length > 0 && userRows[0].lastActiveDate) {
    const lastActive = new Date(userRows[0].lastActiveDate);
    const today = new Date();
    // Use date-only comparison to avoid timezone issues
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    daysInactive = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    inactivityPenalty = Math.min(PENALTY_MAX, Math.max(0, (daysInactive - PENALTY_GRACE_DAYS) * PENALTY_PER_DAY));
  }
  // Brand new user with no lastActiveDate: no penalty

  // 8. Final weighted score
  let rawScore = 0;
  for (const [groupId, gs] of Object.entries(groupScores)) {
    rawScore += gs.score * (GROUP_WEIGHTS[groupId] ?? 0);
  }
  rawScore += examScore * EXAM_WEIGHT;
  rawScore = Math.round(rawScore * 100) / 100;

  const finalScore = Math.max(0, Math.round(rawScore - inactivityPenalty));

  return {
    finalScore,
    rawScore,
    inactivityPenalty,
    daysInactive,
    examScore: Math.round(examScore * 100) / 100,
    examCount,
    groupScores,
  };
}
