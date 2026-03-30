CREATE TABLE "ai_daily_usage" (
	"user_id" uuid NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_daily_usage_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "ai_solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"context_type" varchar(20) NOT NULL,
	"source_problem_id" varchar(20),
	"title" varchar(255) NOT NULL,
	"prompt_text" text,
	"had_screenshot" boolean DEFAULT false NOT NULL,
	"context_hint" text,
	"html_content" text NOT NULL,
	"llm_provider" varchar(20) NOT NULL,
	"llm_model" varchar(50) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" uuid NOT NULL,
	"problem_id" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "bookmarks_user_id_problem_id_pk" PRIMARY KEY("user_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"university" varchar(200) NOT NULL,
	"name" varchar(200) NOT NULL,
	"short_name" varchar(50) NOT NULL,
	"exam_duration" integer NOT NULL,
	"exam_num_problems" integer NOT NULL,
	"exam_num_options" integer DEFAULT 5 NOT NULL,
	"scoring_correct" numeric(4, 2) DEFAULT '1.0' NOT NULL,
	"scoring_wrong" numeric(4, 2) DEFAULT '0.0' NOT NULL,
	"scoring_blank" numeric(4, 2) DEFAULT '0.0' NOT NULL,
	"exam_date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_scores" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"total_score" numeric(10, 2) DEFAULT '0' NOT NULL,
	"problems_solved" integer DEFAULT 0 NOT NULL,
	"exams_completed" integer DEFAULT 0 NOT NULL,
	"avg_exam_percent" numeric(5, 2) DEFAULT '0',
	"best_exam_percent" numeric(5, 2) DEFAULT '0',
	"streak_best" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mock_exam_problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"problem_id" varchar(20) NOT NULL,
	"position" integer NOT NULL,
	"point_value" numeric(4, 2) NOT NULL,
	"answer" varchar(10),
	"is_correct" boolean,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mock_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"faculty_id" varchar(20) NOT NULL,
	"test_size" varchar(20) DEFAULT 'full' NOT NULL,
	"mode" varchar(20) DEFAULT 'timed' NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"duration_limit" integer,
	"started_at" timestamp with time zone DEFAULT now(),
	"finished_at" timestamp with time zone,
	"time_spent" integer,
	"score" numeric(6, 2),
	"max_score" numeric(6, 2),
	"score_percent" numeric(5, 2),
	"num_correct" integer DEFAULT 0,
	"num_wrong" integer DEFAULT 0,
	"num_blank" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "problem_progress" (
	"user_id" uuid NOT NULL,
	"problem_id" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'unseen' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_answer" varchar(10),
	"is_correct" boolean,
	"context" varchar(20) DEFAULT 'practice' NOT NULL,
	"solved_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "problem_progress_user_id_problem_id_pk" PRIMARY KEY("user_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"exam_period_start" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "solution_daily_usage" (
	"user_id" uuid NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "solution_daily_usage_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "solution_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" varchar(20) NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"accuracy_percent" numeric(5, 2) DEFAULT '0',
	"avg_solve_time_sec" integer DEFAULT 0,
	"percentile_rank" numeric(5, 2) DEFAULT '0',
	"total_simulations" integer DEFAULT 0,
	"problems_solved" integer DEFAULT 0,
	"problems_attempted" integer DEFAULT 0,
	"category_breakdown" jsonb DEFAULT '{}'::jsonb,
	"strengths" jsonb DEFAULT '[]'::jsonb,
	"weaknesses" jsonb DEFAULT '[]'::jsonb,
	"trend_data" jsonb DEFAULT '[]'::jsonb,
	"readiness_score" numeric(5, 2) DEFAULT '0',
	"readiness_breakdown" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"avatar_url" text,
	"password_hash" varchar(255),
	"role" varchar(10) DEFAULT 'student' NOT NULL,
	"target_faculties" jsonb DEFAULT '[]'::jsonb,
	"streak_current" integer DEFAULT 0 NOT NULL,
	"streak_best" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"daily_goal" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_daily_usage" ADD CONSTRAINT "ai_daily_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_scores" ADD CONSTRAINT "leaderboard_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exam_problems" ADD CONSTRAINT "mock_exam_problems_exam_id_mock_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."mock_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_progress" ADD CONSTRAINT "problem_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_daily_usage" ADD CONSTRAINT "solution_daily_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_views" ADD CONSTRAINT "solution_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_solutions_user" ON "ai_solutions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_solutions_created" ON "ai_solutions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_solutions_source" ON "ai_solutions" USING btree ("source_problem_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_total" ON "leaderboard_scores" USING btree ("total_score");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_exam_position" ON "mock_exam_problems" USING btree ("exam_id","position");--> statement-breakpoint
CREATE INDEX "idx_exam_problems_exam" ON "mock_exam_problems" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exams_user" ON "mock_exams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exams_faculty" ON "mock_exams" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exams_status" ON "mock_exams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_mock_exams_status_finished" ON "mock_exams" USING btree ("status","finished_at");--> statement-breakpoint
CREATE INDEX "idx_progress_user_status" ON "problem_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_progress_user_solved" ON "problem_progress" USING btree ("user_id","solved_at");--> statement-breakpoint
CREATE INDEX "idx_progress_problem" ON "problem_progress" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "idx_solution_views_user" ON "solution_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_solution_views_user_date" ON "solution_views" USING btree ("user_id","viewed_at");--> statement-breakpoint
CREATE INDEX "idx_solution_views_problem" ON "solution_views" USING btree ("problem_id");