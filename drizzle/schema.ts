import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  displayName: varchar("display_name", { length: 50 }).notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 10 }).notNull().default("student"),
  targetFaculty: varchar("target_faculty", { length: 20 }),
  streakCurrent: integer("streak_current").notNull().default(0),
  streakBest: integer("streak_best").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const faculties = pgTable("faculties", {
  id: varchar("id", { length: 20 }).primaryKey(),
  university: varchar("university", { length: 200 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("short_name", { length: 50 }).notNull(),
  examDuration: integer("exam_duration").notNull(),
  examNumProblems: integer("exam_num_problems").notNull(),
  examNumOptions: integer("exam_num_options").notNull().default(5),
  scoringCorrect: numeric("scoring_correct", { precision: 4, scale: 2 }).notNull().default("1.0"),
  scoringWrong: numeric("scoring_wrong", { precision: 4, scale: 2 }).notNull().default("0.0"),
  scoringBlank: numeric("scoring_blank", { precision: 4, scale: 2 }).notNull().default("0.0"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const topics = pgTable("topics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const problems = pgTable(
  "problems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    facultyId: varchar("faculty_id", { length: 20 })
      .notNull()
      .references(() => faculties.id),
    year: integer("year").notNull(),
    problemNumber: integer("problem_number").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    htmlContent: text("html_content").notNull(),
    problemText: text("problem_text"),
    correctAnswer: varchar("correct_answer", { length: 10 }).notNull(),
    answerOptions: jsonb("answer_options").notNull(),
    numOptions: integer("num_options").notNull().default(5),
    logicScratchpad: text("logic_scratchpad"),
    slug: varchar("slug", { length: 200 }).unique().notNull(),
    difficulty: numeric("difficulty", { precision: 3, scale: 1 }),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_problems_faculty").on(table.facultyId),
    index("idx_problems_year").on(table.year),
    index("idx_problems_slug").on(table.slug),
  ]
);

export const problemTopics = pgTable(
  "problem_topics",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    topicId: varchar("topic_id", { length: 50 })
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.problemId, table.topicId] }),
    index("idx_problem_topics_topic").on(table.topicId),
  ]
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.problemId] })]
);

export const problemProgress = pgTable(
  "problem_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("unseen"),
    attempts: integer("attempts").notNull().default(0),
    lastAnswer: varchar("last_answer", { length: 10 }),
    isCorrect: boolean("is_correct"),
    solvedAt: timestamp("solved_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.problemId] })]
);

export const mockExams = pgTable(
  "mock_exams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    facultyId: varchar("faculty_id", { length: 20 })
      .notNull()
      .references(() => faculties.id),
    status: varchar("status", { length: 20 }).notNull().default("in_progress"),
    durationLimit: integer("duration_limit").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    timeSpent: integer("time_spent"),
    score: numeric("score", { precision: 6, scale: 2 }),
    maxScore: numeric("max_score", { precision: 6, scale: 2 }),
    scorePercent: numeric("score_percent", { precision: 5, scale: 2 }),
    numCorrect: integer("num_correct").default(0),
    numWrong: integer("num_wrong").default(0),
    numBlank: integer("num_blank").default(0),
  },
  (table) => [
    index("idx_mock_exams_user").on(table.userId),
    index("idx_mock_exams_faculty").on(table.facultyId),
    index("idx_mock_exams_status").on(table.status),
  ]
);

export const mockExamProblems = pgTable(
  "mock_exam_problems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => mockExams.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id),
    position: integer("position").notNull(),
    answer: varchar("answer", { length: 10 }),
    isCorrect: boolean("is_correct"),
    isFlagged: boolean("is_flagged").notNull().default(false),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("unq_exam_position").on(table.examId, table.position),
    index("idx_exam_problems_exam").on(table.examId),
  ]
);

export const leaderboardScores = pgTable(
  "leaderboard_scores",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id),
    displayName: varchar("display_name", { length: 50 }).notNull(),
    totalScore: numeric("total_score", { precision: 10, scale: 2 }).notNull().default("0"),
    problemsSolved: integer("problems_solved").notNull().default(0),
    examsCompleted: integer("exams_completed").notNull().default(0),
    avgExamPercent: numeric("avg_exam_percent", { precision: 5, scale: 2 }).default("0"),
    bestExamPercent: numeric("best_exam_percent", { precision: 5, scale: 2 }).default("0"),
    streakBest: integer("streak_best").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_leaderboard_total").on(table.totalScore),
  ]
);

export const aiSolutions = pgTable(
  "ai_solutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    contextType: varchar("context_type", { length: 20 }).notNull(),
    sourceProblemId: uuid("source_problem_id").references(() => problems.id),
    title: varchar("title", { length: 255 }).notNull(),
    promptText: text("prompt_text"),
    hadScreenshot: boolean("had_screenshot").notNull().default(false),
    contextHint: text("context_hint"),
    htmlContent: text("html_content").notNull(),
    llmProvider: varchar("llm_provider", { length: 20 }).notNull(),
    llmModel: varchar("llm_model", { length: 50 }).notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }).notNull().default("0"),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_ai_solutions_user").on(table.userId),
    index("idx_ai_solutions_created").on(table.createdAt),
    index("idx_ai_solutions_source").on(table.sourceProblemId),
  ]
);

export const aiDailyUsage = pgTable(
  "ai_daily_usage",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    date: date("date").notNull().defaultNow(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.date] })]
);
