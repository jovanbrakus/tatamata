import { db } from "@/lib/db";
import { leaderboardScores, users, problemProgress, mockExams } from "@/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

export async function recalculateLeaderboard(userId?: string) {
  const query = userId
    ? sql`
        INSERT INTO leaderboard_scores (user_id, display_name, problems_solved, exams_completed, avg_exam_percent, best_exam_percent, streak_best, total_score, updated_at)
        SELECT
          u.id,
          u.display_name,
          COALESCE(pp.solved, 0),
          COALESCE(me.completed, 0),
          COALESCE(me.avg_pct, 0),
          COALESCE(me.best_pct, 0),
          u.streak_best,
          (COALESCE(pp.solved, 0) * 1 + COALESCE(me.completed, 0) * 10 + COALESCE(me.avg_pct, 0) * 2 + u.streak_best * 5),
          NOW()
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) as solved
          FROM problem_progress
          WHERE status = 'solved'
          GROUP BY user_id
        ) pp ON pp.user_id = u.id
        LEFT JOIN (
          SELECT user_id,
                 COUNT(*) as completed,
                 AVG(score_percent::numeric) as avg_pct,
                 MAX(score_percent::numeric) as best_pct
          FROM mock_exams
          WHERE status = 'completed'
          GROUP BY user_id
        ) me ON me.user_id = u.id
        WHERE u.id = ${userId}
        ON CONFLICT (user_id)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          problems_solved = EXCLUDED.problems_solved,
          exams_completed = EXCLUDED.exams_completed,
          avg_exam_percent = EXCLUDED.avg_exam_percent,
          best_exam_percent = EXCLUDED.best_exam_percent,
          streak_best = EXCLUDED.streak_best,
          total_score = EXCLUDED.total_score,
          updated_at = NOW()
      `
    : sql`
        INSERT INTO leaderboard_scores (user_id, display_name, problems_solved, exams_completed, avg_exam_percent, best_exam_percent, streak_best, total_score, updated_at)
        SELECT
          u.id,
          u.display_name,
          COALESCE(pp.solved, 0),
          COALESCE(me.completed, 0),
          COALESCE(me.avg_pct, 0),
          COALESCE(me.best_pct, 0),
          u.streak_best,
          (COALESCE(pp.solved, 0) * 1 + COALESCE(me.completed, 0) * 10 + COALESCE(me.avg_pct, 0) * 2 + u.streak_best * 5),
          NOW()
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) as solved
          FROM problem_progress
          WHERE status = 'solved'
          GROUP BY user_id
        ) pp ON pp.user_id = u.id
        LEFT JOIN (
          SELECT user_id,
                 COUNT(*) as completed,
                 AVG(score_percent::numeric) as avg_pct,
                 MAX(score_percent::numeric) as best_pct
          FROM mock_exams
          WHERE status = 'completed'
          GROUP BY user_id
        ) me ON me.user_id = u.id
        WHERE u.is_active = true
        ON CONFLICT (user_id)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          problems_solved = EXCLUDED.problems_solved,
          exams_completed = EXCLUDED.exams_completed,
          avg_exam_percent = EXCLUDED.avg_exam_percent,
          best_exam_percent = EXCLUDED.best_exam_percent,
          streak_best = EXCLUDED.streak_best,
          total_score = EXCLUDED.total_score,
          updated_at = NOW()
      `;

  await db.execute(query);
}
