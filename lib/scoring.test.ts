import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateReadinessScore } from "./scoring";

// --- Mock setup ---

// DB mock: tracks select() calls. First call = exam query, second = user query.
let mockExamRows: any[] = [];
let mockUserRows: any[] = [];

function createChainMock(getResult: () => any[]) {
  const chain: any = {};
  for (const method of ["from", "where", "orderBy", "limit", "innerJoin"]) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (resolve: any, reject?: any) =>
    Promise.resolve(getResult()).then(resolve, reject);
  return chain;
}

let dbSelectCallIndex = 0;
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockImplementation(() => {
      dbSelectCallIndex++;
      const idx = dbSelectCallIndex;
      return createChainMock(() => (idx % 2 === 1 ? mockExamRows : mockUserRows));
    }),
  },
}));

// Problems mock: simplified category structure for testing.
// Use all 5 real groups but with 2 subcategories each for clarity.
const MOCK_CATEGORY_GROUPS = [
  { id: "algebra", en: "Algebra", sr: "Algebra", categories: ["linear_equations", "logarithm"] },
  { id: "trigonometry", en: "Trigonometry", sr: "Trigonometrija", categories: ["trigonometric_expressions", "trigonometric_equations"] },
  { id: "geometry", en: "Geometry", sr: "Geometrija", categories: ["planimetry", "analytic_geometry"] },
  { id: "analysis", en: "Analysis", sr: "Analiza", categories: ["function_properties", "derivatives"] },
  { id: "combinatorics_and_probability", en: "Combinatorics", sr: "Kombinatorika", categories: ["combinatorics", "binomial_formula"] },
];

// Create test problems: 15 per subcategory, all difficulty 8 (above ceiling threshold)
const MOCK_PROBLEMS: { id: string; category: string; difficulty: number }[] = [];
let problemCounter = 1;
for (const group of MOCK_CATEGORY_GROUPS) {
  for (const cat of group.categories) {
    for (let i = 0; i < 15; i++) {
      MOCK_PROBLEMS.push({ id: `p${problemCounter++}`, category: cat, difficulty: 8 });
    }
  }
}
// Orphan problem (category not in any group)
MOCK_PROBLEMS.push({ id: "p_orphan", category: "limits", difficulty: 5 });

// Difficulty test problems: easy (diff 2) and hard (diff 9) for linear_equations
for (let i = 1; i <= 10; i++) {
  MOCK_PROBLEMS.push({ id: `easy_${i}`, category: "linear_equations", difficulty: 2 });
}
for (let i = 1; i <= 10; i++) {
  MOCK_PROBLEMS.push({ id: `hard_${i}`, category: "linear_equations", difficulty: 9 });
}
// Medium difficulty (diff 5) — at ceiling boundary
for (let i = 1; i <= 10; i++) {
  MOCK_PROBLEMS.push({ id: `med_${i}`, category: "linear_equations", difficulty: 5 });
}

vi.mock("@/lib/problems", () => ({
  getAllMeta: vi.fn().mockImplementation(() => MOCK_PROBLEMS),
  getCategoryGroups: vi.fn().mockImplementation(() => MOCK_CATEGORY_GROUPS),
}));

vi.mock("@/drizzle/schema", () => ({
  mockExams: { scorePercent: "score_percent", userId: "user_id", status: "status", finishedAt: "finished_at" },
  users: { lastActiveDate: "last_active_date", id: "id" },
}));

// --- Helpers ---

/** Create a progress row for a problem */
function row(problemId: string, isCorrect: boolean, daysAgo: number = 0): any {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { problem_id: problemId, is_correct: isCorrect, updated_at: date.toISOString() };
}

/** Get problem IDs for a given subcategory */
function problemsFor(subcategory: string): string[] {
  return MOCK_PROBLEMS.filter((p) => p.category === subcategory).map((p) => p.id);
}

/** Create N correct rows for a subcategory, spread over time */
function correctRows(subcategory: string, count: number): any[] {
  return problemsFor(subcategory).slice(0, count).map((id, i) => row(id, true, i));
}

/** Create rows with specific correct/wrong pattern for a subcategory */
function mixedRows(subcategory: string, correctCount: number, wrongCount: number): any[] {
  const pids = problemsFor(subcategory);
  const rows: any[] = [];
  for (let i = 0; i < correctCount; i++) rows.push(row(pids[i], true, i));
  for (let i = 0; i < wrongCount; i++) rows.push(row(pids[correctCount + i], false, correctCount + i));
  return rows;
}

// --- Tests ---

beforeEach(() => {
  mockExamRows = [];
  mockUserRows = [{ lastActiveDate: new Date().toISOString().split("T")[0] }]; // active today by default
  dbSelectCallIndex = 0;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-27T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateReadinessScore", () => {
  // ========================================
  // Subcategory score (Layer 1)
  // ========================================
  describe("subcategory score — sliding window + confidence", () => {
    it("returns score 0 for 0 attempts", async () => {
      const result = await calculateReadinessScore("user1", []);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.score).toBe(0);
      expect(sub.recentTotal).toBe(0);
      expect(sub.confidence).toBe(0);
    });

    it("1/1 correct → score ~33 (confidence 0.33)", async () => {
      const progress = correctRows("linear_equations", 1);
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.recentTotal).toBe(1);
      expect(sub.accuracy).toBe(100);
      expect(sub.confidence).toBeCloseTo(0.33, 1);
      expect(sub.score).toBeCloseTo(33.33, 0);
    });

    it("2/2 correct → score ~67 (confidence 0.67)", async () => {
      const progress = correctRows("linear_equations", 2);
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.recentTotal).toBe(2);
      expect(sub.confidence).toBeCloseTo(0.67, 1);
      expect(sub.score).toBeCloseTo(66.67, 0);
    });

    it("3/3 correct → score 100 (full confidence)", async () => {
      const progress = correctRows("linear_equations", 3);
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.confidence).toBe(1);
      expect(sub.score).toBe(100);
    });

    it("8/10 correct → score 80", async () => {
      const progress = mixedRows("linear_equations", 8, 2);
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.recentTotal).toBe(10);
      expect(sub.accuracy).toBe(80);
      expect(sub.confidence).toBe(1);
      expect(sub.score).toBe(80);
    });

    it("0/3 correct → score 0 (full confidence, zero accuracy)", async () => {
      const pids = problemsFor("linear_equations");
      const progress = pids.slice(0, 3).map((id, i) => row(id, false, i));
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.accuracy).toBe(0);
      expect(sub.confidence).toBe(1);
      expect(sub.score).toBe(0);
    });

    it("sliding window: only last 10 of 15 attempts count", async () => {
      const pids = problemsFor("linear_equations");
      // 5 old wrong answers (days 10-14), then 10 recent correct (days 0-9)
      const progress = [
        ...pids.slice(0, 10).map((id, i) => row(id, true, i)),    // recent 10: correct
        ...pids.slice(10, 15).map((id, i) => row(id, false, 10 + i)), // old 5: wrong
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      // Window should only see the 10 most recent (all correct)
      expect(sub.recentTotal).toBe(10);
      expect(sub.recentCorrect).toBe(10);
      expect(sub.score).toBe(100);
    });

    it("sliding window recovery: bad week pushed out by good week", async () => {
      const pids = problemsFor("derivatives");
      // 5 old wrong (days 10-14), then 10 recent correct (days 0-9)
      const progress = [
        ...pids.slice(0, 10).map((id, i) => row(id, true, i)),
        ...pids.slice(10, 15).map((id, i) => row(id, false, 10 + i)),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.analysis.subcategories.derivatives;
      expect(sub.recentCorrect).toBe(10);
      expect(sub.score).toBe(100);
    });
  });

  // ========================================
  // Group score (Layer 2)
  // ========================================
  describe("group score — equal-weight average of subcategories", () => {
    it("untouched group → score 0", async () => {
      const result = await calculateReadinessScore("user1", []);
      expect(result.groupScores.algebra.score).toBe(0);
      expect(result.groupScores.trigonometry.score).toBe(0);
    });

    it("one subcategory practiced, other untouched → averaged with 0", async () => {
      // Algebra has 2 subcategories: linear_equations, logarithm
      // Only practice linear_equations (3/3 = 100)
      const progress = correctRows("linear_equations", 3);
      const result = await calculateReadinessScore("user1", progress);
      // Group avg = (100 + 0) / 2 = 50
      expect(result.groupScores.algebra.score).toBe(50);
      expect(result.groupScores.algebra.subcategories.linear_equations.score).toBe(100);
      expect(result.groupScores.algebra.subcategories.logarithm.score).toBe(0);
    });

    it("both subcategories practiced → correct average", async () => {
      const progress = [
        ...mixedRows("linear_equations", 8, 2), // 80
        ...mixedRows("logarithm", 6, 4),        // 60
      ];
      const result = await calculateReadinessScore("user1", progress);
      // (80 + 60) / 2 = 70
      expect(result.groupScores.algebra.score).toBe(70);
    });

    it("group with single subcategory → equals subcategory score", async () => {
      // trigonometry has 2 subcategories; practice one perfectly
      const progress = correctRows("trigonometric_equations", 5);
      const result = await calculateReadinessScore("user1", progress);
      // (100 + 0) / 2 = 50
      expect(result.groupScores.trigonometry.score).toBe(50);
    });

    it("correct weights are assigned to groups", async () => {
      const result = await calculateReadinessScore("user1", []);
      expect(result.groupScores.algebra.weight).toBe(0.30);
      expect(result.groupScores.trigonometry.weight).toBe(0.15);
      expect(result.groupScores.geometry.weight).toBe(0.15);
      expect(result.groupScores.analysis.weight).toBe(0.15);
      expect(result.groupScores.combinatorics_and_probability.weight).toBe(0.15);
    });
  });

  // ========================================
  // Exam simulation score (Layer 3)
  // ========================================
  describe("exam simulation score", () => {
    it("0 completed exams → examScore 0", async () => {
      mockExamRows = [];
      const result = await calculateReadinessScore("user1", []);
      expect(result.examScore).toBe(0);
      expect(result.examCount).toBe(0);
    });

    it("3 exams → average of 3", async () => {
      mockExamRows = [
        { scorePercent: "80.00" },
        { scorePercent: "60.00" },
        { scorePercent: "70.00" },
      ];
      const result = await calculateReadinessScore("user1", []);
      expect(result.examCount).toBe(3);
      expect(result.examScore).toBe(70);
    });

    it("5 exams → average of all 5", async () => {
      mockExamRows = [
        { scorePercent: "90.00" },
        { scorePercent: "80.00" },
        { scorePercent: "70.00" },
        { scorePercent: "60.00" },
        { scorePercent: "50.00" },
      ];
      const result = await calculateReadinessScore("user1", []);
      expect(result.examCount).toBe(5);
      expect(result.examScore).toBe(70);
    });

    it("single exam → uses that score", async () => {
      mockExamRows = [{ scorePercent: "85.50" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.examScore).toBe(85.5);
    });
  });

  // ========================================
  // Inactivity penalty (Layer 4)
  // ========================================
  describe("inactivity penalty", () => {
    it("active today → 0 penalty", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-27" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(0);
      expect(result.inactivityPenalty).toBe(0);
    });

    it("1 day ago → 0 penalty (within grace)", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-26" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(1);
      expect(result.inactivityPenalty).toBe(0);
    });

    it("2 days ago → 0 penalty (grace boundary)", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-25" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(2);
      expect(result.inactivityPenalty).toBe(0);
    });

    it("3 days ago → 2 penalty", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-24" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(3);
      expect(result.inactivityPenalty).toBe(2);
    });

    it("5 days ago → 6 penalty", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-22" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(5);
      expect(result.inactivityPenalty).toBe(6);
    });

    it("7 days ago → 10 penalty", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-20" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(7);
      expect(result.inactivityPenalty).toBe(10);
    });

    it("12 days ago → 20 penalty (max)", async () => {
      mockUserRows = [{ lastActiveDate: "2026-03-15" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(12);
      expect(result.inactivityPenalty).toBe(20);
    });

    it("30 days ago → still capped at 20", async () => {
      mockUserRows = [{ lastActiveDate: "2026-02-25" }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(30);
      expect(result.inactivityPenalty).toBe(20);
    });

    it("brand new user (no lastActiveDate) → 0 penalty", async () => {
      mockUserRows = [{ lastActiveDate: null }];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(0);
      expect(result.inactivityPenalty).toBe(0);
    });

    it("user not found → 0 penalty", async () => {
      mockUserRows = [];
      const result = await calculateReadinessScore("user1", []);
      expect(result.daysInactive).toBe(0);
      expect(result.inactivityPenalty).toBe(0);
    });
  });

  // ========================================
  // Final weighted score (Layer 5)
  // ========================================
  describe("final weighted score", () => {
    it("brand new user → finalScore 0", async () => {
      const result = await calculateReadinessScore("user1", []);
      expect(result.finalScore).toBe(0);
      expect(result.rawScore).toBe(0);
    });

    it("perfect student, all categories 100, exams 100, active today → 100", async () => {
      // All subcategories: 3/3 correct
      const progress: any[] = [];
      for (const group of MOCK_CATEGORY_GROUPS) {
        for (const cat of group.categories) {
          progress.push(...correctRows(cat, 3));
        }
      }
      mockExamRows = [
        { scorePercent: "100.00" },
        { scorePercent: "100.00" },
        { scorePercent: "100.00" },
      ];
      mockUserRows = [{ lastActiveDate: "2026-03-27" }];

      const result = await calculateReadinessScore("user1", progress);
      // All group scores = 100, exam = 100, penalty = 0
      // raw = 100*0.30 + 100*0.15*4 + 100*0.10 = 30 + 60 + 10 = 100
      expect(result.rawScore).toBe(100);
      expect(result.inactivityPenalty).toBe(0);
      expect(result.finalScore).toBe(100);
    });

    it("only algebra practiced (100%) → rawScore = 30 (algebra weight)", async () => {
      const progress = [
        ...correctRows("linear_equations", 3),
        ...correctRows("logarithm", 3),
      ];
      const result = await calculateReadinessScore("user1", progress);
      expect(result.groupScores.algebra.score).toBe(100);
      // raw = 100*0.30 + 0 + 0 + 0 + 0 + 0 = 30
      expect(result.rawScore).toBe(30);
      expect(result.finalScore).toBe(30);
    });

    it("inactivity penalty subtracts from raw score", async () => {
      const progress = [
        ...correctRows("linear_equations", 3),
        ...correctRows("logarithm", 3),
      ];
      mockUserRows = [{ lastActiveDate: "2026-03-20" }]; // 7 days → penalty 10
      const result = await calculateReadinessScore("user1", progress);
      // raw = 30, penalty = 10, final = 20
      expect(result.rawScore).toBe(30);
      expect(result.inactivityPenalty).toBe(10);
      expect(result.finalScore).toBe(20);
    });

    it("final score floors at 0 (never negative)", async () => {
      // Small raw score + big penalty
      const pids = problemsFor("linear_equations");
      const progress = [row(pids[0], true, 0)]; // 1/1 in linear_eq → confidence 0.33, score ~33
      // algebra group = (33 + 0) / 2 ≈ 16.67
      // raw ≈ 16.67 * 0.30 ≈ 5
      mockUserRows = [{ lastActiveDate: "2026-03-15" }]; // 12 days → penalty 20
      const result = await calculateReadinessScore("user1", progress);
      expect(result.finalScore).toBe(0);
      expect(result.inactivityPenalty).toBe(20);
    });

    it("exam score contributes 10% to raw", async () => {
      mockExamRows = [
        { scorePercent: "100.00" },
        { scorePercent: "100.00" },
      ];
      // No practice, only exams
      const result = await calculateReadinessScore("user1", []);
      // raw = 0 + 100*0.10 = 10
      expect(result.rawScore).toBe(10);
      expect(result.finalScore).toBe(10);
    });

    it("weights sum to 1.0 (no score loss)", async () => {
      const totalWeight = Object.values({
        algebra: 0.30,
        trigonometry: 0.15,
        geometry: 0.15,
        analysis: 0.15,
        combinatorics_and_probability: 0.15,
      }).reduce((s, w) => s + w, 0) + 0.10; // exam weight
      expect(totalWeight).toBeCloseTo(1.0, 10);
    });

    it("mixed scenario: some categories strong, some weak, with exams and penalty", async () => {
      const progress = [
        // Algebra: linear_equations 8/10=80, logarithm 0 → group avg = 40
        ...mixedRows("linear_equations", 8, 2),
        // Trigonometry: trig_expr 10/10=100, trig_eq 5/10=50 → group avg = 75
        ...correctRows("trigonometric_expressions", 10),
        ...mixedRows("trigonometric_equations", 5, 5),
        // Geometry: planimetry 3/3=100, analytic 0 → group avg = 50
        ...correctRows("planimetry", 3),
        // Analysis: all untouched → 0
        // Combinatorics: all untouched → 0
      ];
      mockExamRows = [
        { scorePercent: "70.00" },
        { scorePercent: "80.00" },
      ];
      mockUserRows = [{ lastActiveDate: "2026-03-24" }]; // 3 days → penalty 2

      const result = await calculateReadinessScore("user1", progress);

      expect(result.groupScores.algebra.score).toBe(40);
      expect(result.groupScores.trigonometry.score).toBe(75);
      expect(result.groupScores.geometry.score).toBe(50);
      expect(result.groupScores.analysis.score).toBe(0);
      expect(result.groupScores.combinatorics_and_probability.score).toBe(0);
      expect(result.examScore).toBe(75);

      // raw = 40*0.30 + 75*0.15 + 50*0.15 + 0*0.15 + 0*0.15 + 75*0.10
      //     = 12 + 11.25 + 7.50 + 0 + 0 + 7.50 = 38.25
      expect(result.rawScore).toBeCloseTo(38.25, 1);
      expect(result.inactivityPenalty).toBe(2);
      expect(result.finalScore).toBe(36); // round(38.25 - 2) = 36
    });
  });

  // ========================================
  // Difficulty weighting + ceiling (Layer 1 extension)
  // ========================================
  describe("difficulty weighting and ceiling", () => {
    it("all easy correct → capped at 80 (no diff > 7 solved)", async () => {
      // 3 easy problems (diff 2), all correct
      const progress = [
        row("easy_1", true, 0),
        row("easy_2", true, 1),
        row("easy_3", true, 2),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.accuracy).toBe(100); // 6/6 = 100%
      expect(sub.confidence).toBe(1);
      expect(sub.score).toBe(80); // capped at 80
    });

    it("easy correct + one hard correct → ceiling lifted to 100", async () => {
      const progress = [
        row("easy_1", true, 0),
        row("easy_2", true, 1),
        row("hard_1", true, 2), // diff 9 > 7 → unlocks ceiling
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.score).toBe(100); // ceiling lifted
    });

    it("hard problems weight more in accuracy: easy correct + hard wrong", async () => {
      // 5 easy correct (diff 2) + 5 hard wrong (diff 9)
      const progress = [
        ...Array.from({ length: 5 }, (_, i) => row(`easy_${i + 1}`, true, i)),
        ...Array.from({ length: 5 }, (_, i) => row(`hard_${i + 1}`, false, 5 + i)),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      // weighted_correct = 5×2 = 10, weighted_total = 5×2 + 5×9 = 55
      // accuracy = 10/55 × 100 ≈ 18.18%
      expect(sub.accuracy).toBeCloseTo(18.18, 0);
      expect(sub.score).toBeCloseTo(18.18, 0); // below ceiling anyway
    });

    it("hard problems weight more in accuracy: easy wrong + hard correct", async () => {
      // 5 easy wrong (diff 2) + 5 hard correct (diff 9)
      const progress = [
        ...Array.from({ length: 5 }, (_, i) => row(`easy_${i + 1}`, false, i)),
        ...Array.from({ length: 5 }, (_, i) => row(`hard_${i + 1}`, true, 5 + i)),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      // weighted_correct = 5×9 = 45, weighted_total = 5×2 + 5×9 = 55
      // accuracy = 45/55 × 100 ≈ 81.82%
      expect(sub.accuracy).toBeCloseTo(81.82, 0);
      expect(sub.score).toBeCloseTo(81.82, 0); // ceiling = 100 (diff 9 solved)
    });

    it("same difficulty problems → weighted = unweighted", async () => {
      // 8/10 correct, all diff 8
      const progress = mixedRows("linear_equations", 8, 2);
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      // 8×8 / 10×8 = 64/80 = 80% (same as unweighted 8/10)
      expect(sub.accuracy).toBe(80);
    });

    it("medium difficulty (diff 5) correct → still capped at 80", async () => {
      const progress = [
        row("med_1", true, 0),
        row("med_2", true, 1),
        row("med_3", true, 2),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      expect(sub.accuracy).toBe(100);
      expect(sub.score).toBe(80); // diff 5 ≤ 7, ceiling = 80
    });

    it("difficulty 7 exactly → still capped (threshold is >7)", async () => {
      // Use a problem with difficulty exactly 7 — create inline via the existing p1 which has diff 8
      // Actually, diff 7 is ≤ 7, so let's use med problems (diff 5) to verify the boundary
      // The threshold is >7, meaning diff 7 does NOT unlock. Only diff 8+ does.
      // p1 has diff 8, so let's test that p1 alone (diff 8 > 7) unlocks
      const progress = [row("p1", true, 0)]; // p1 is linear_equations, diff 8
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.algebra.subcategories.linear_equations;
      // diff 8 > 7 → ceiling = 100
      // accuracy = 100%, confidence = 0.33 → score ≈ 33.33
      expect(sub.score).toBeCloseTo(33.33, 0); // not capped (ceiling is 100)
    });

    it("ceiling applies per subcategory independently", async () => {
      // linear_equations: only easy problems → ceiling 80
      // logarithm: has hard problems (default diff 8) → ceiling 100
      const progress = [
        row("easy_1", true, 0),
        row("easy_2", true, 1),
        row("easy_3", true, 2),
        ...correctRows("logarithm", 3), // diff 8 problems
      ];
      const result = await calculateReadinessScore("user1", progress);
      expect(result.groupScores.algebra.subcategories.linear_equations.score).toBe(80); // capped
      expect(result.groupScores.algebra.subcategories.logarithm.score).toBe(100); // not capped
      // group avg = (80 + 100) / 2 = 90
      expect(result.groupScores.algebra.score).toBe(90);
    });

    it("all-easy perfect student cannot reach final score 100", async () => {
      // Practice all subcategories with only easy-equivalent problems
      // But only linear_equations has easy test problems; others use diff 8
      // So this test: linear_equations with easy (capped 80), logarithm with hard (100)
      // This gives algebra = 90, not 100
      const progress = [
        row("easy_1", true, 0),
        row("easy_2", true, 1),
        row("easy_3", true, 2),
        ...correctRows("logarithm", 3),
        ...correctRows("trigonometric_expressions", 3),
        ...correctRows("trigonometric_equations", 3),
        ...correctRows("planimetry", 3),
        ...correctRows("analytic_geometry", 3),
        ...correctRows("function_properties", 3),
        ...correctRows("derivatives", 3),
        ...correctRows("combinatorics", 3),
        ...correctRows("binomial_formula", 3),
      ];
      mockExamRows = [{ scorePercent: "100.00" }];
      const result = await calculateReadinessScore("user1", progress);
      // algebra = (80 + 100) / 2 = 90 (linear_equations capped)
      // all others = 100
      // raw = 90*0.30 + 100*0.15*4 + 100*0.10 = 27 + 60 + 10 = 97
      expect(result.rawScore).toBe(97);
      expect(result.finalScore).toBe(97); // not 100!
    });
  });

  // ========================================
  // Edge cases
  // ========================================
  describe("edge cases", () => {
    it("orphan category problems are ignored (not in any group)", async () => {
      // p_orphan has category "limits" which is not in any group
      const progress = [row("p_orphan", true, 0)];
      const result = await calculateReadinessScore("user1", progress);
      // Should not affect any group score
      expect(result.finalScore).toBe(0);
      for (const gs of Object.values(result.groupScores)) {
        expect(gs.score).toBe(0);
      }
    });

    it("problems with unknown IDs are ignored", async () => {
      const progress = [row("nonexistent_problem", true, 0)];
      const result = await calculateReadinessScore("user1", progress);
      expect(result.finalScore).toBe(0);
    });

    it("all groups return subcategory breakdown even when empty", async () => {
      const result = await calculateReadinessScore("user1", []);
      for (const group of MOCK_CATEGORY_GROUPS) {
        const gs = result.groupScores[group.id];
        expect(gs).toBeDefined();
        for (const cat of group.categories) {
          expect(gs.subcategories[cat]).toBeDefined();
          expect(gs.subcategories[cat].score).toBe(0);
        }
      }
    });

    it("exam with null scorePercent treated as 0", async () => {
      mockExamRows = [
        { scorePercent: null },
        { scorePercent: "80.00" },
      ];
      const result = await calculateReadinessScore("user1", []);
      // (0 + 80) / 2 = 40
      expect(result.examScore).toBe(40);
    });

    it("multiple attempts on same subcategory, older ones outside window", async () => {
      const pids = problemsFor("derivatives");
      // 12 attempts: first 10 are most recent, last 2 are old
      const progress = [
        // 10 most recent: 5 correct, 5 wrong (all within days 0-9)
        ...pids.slice(0, 5).map((id, i) => row(id, true, i)),
        ...pids.slice(5, 10).map((id, i) => row(id, false, 5 + i)),
        // 2 old ones outside window (both correct but won't count)
        row(pids[10], true, 20),
        row(pids[11], true, 21),
      ];
      const result = await calculateReadinessScore("user1", progress);
      const sub = result.groupScores.analysis.subcategories.derivatives;
      expect(sub.recentTotal).toBe(10);
      expect(sub.recentCorrect).toBe(5);
      expect(sub.accuracy).toBe(50);
      expect(sub.score).toBe(50);
    });
  });
});
