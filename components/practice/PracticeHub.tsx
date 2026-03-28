"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ─── Types ─── */

interface SubcategoryStat {
  id: string;
  name: string;
  total: number;
  solved: number;
  readinessScore: number;
}

interface CategoryGroup {
  id: string;
  name: string;
  totalProblems: number;
  solvedCorrectly: number;
  progressPercent: number;
  readinessScore: number;
  categories: SubcategoryStat[];
}

/* ─── Styling ─── */

const GROUP_META: Record<string, { icon: string; description?: string; image: string; imageLight: string }> = {
  algebra: {
    icon: "variables",
    description: "Srce matematike. Od osnova proporcije do kompleksnih logaritamskih struktura.",
    image: "/images/categories/algebra.png",
    imageLight: "/images/categories/light/algebra.png",
  },
  trigonometry: { icon: "change_history", image: "/images/categories/trigonometry.png", imageLight: "/images/categories/light/trigonometry.png" },
  geometry: { icon: "category", image: "/images/categories/geometry.png", imageLight: "/images/categories/light/geometry.png" },
  analysis: { icon: "insights", image: "/images/categories/analysis.png", imageLight: "/images/categories/light/analysis.png" },
  combinatorics_and_probability: { icon: "casino", image: "/images/categories/combinatorics_and_probability.png", imageLight: "/images/categories/light/combinatorics_and_probability.png" },
};


/* ─── Circular Score Indicator ─── */

function ScoreCircle({ score, size = 64 }: { score: number; size?: number }) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ec5b13"
          strokeWidth={strokeWidth}
          opacity={0.15}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ec5b13"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-black text-primary"
        style={{ fontSize: size * 0.3 }}
      >
        {score}
      </span>
    </div>
  );
}

/* ─── Subcategory Row ─── */

function SubcategoryRow({ sub }: { sub: SubcategoryStat }) {
  const pct = sub.readinessScore;
  const isComplete = pct === 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center cursor-pointer group/sub">
        <Link
          href={`/zadaci?topic=${sub.id}`}
          className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
        >
          {sub.name}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted">{pct}</span>
          <Link
            href={`/zadaci?topic=${sub.id}`}
            className="w-6 h-6 rounded flex items-center justify-center bg-[var(--tint-strong)] hover:bg-primary hover:text-white transition-all active:scale-90"
          >
            <span
              className="material-symbols-outlined text-xs"
              style={isComplete ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {isComplete ? "check" : "play_arrow"}
            </span>
          </Link>
        </div>
      </div>
      <div className="h-[2px] w-full bg-[var(--tint-strong)] rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Component ─── */

export default function PracticeHub() {
  const { status: sessionStatus } = useSession();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/practice/categories")
      .then((r) => r.json())
      .then((data) => {
        setGroups(data.categories ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionStatus]);

  /* ─── Loading State ─── */
  if (loading || sessionStatus === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-12">
          <div className="h-3 w-32 animate-pulse rounded bg-[var(--tint-strong)] mb-4" />
          <div className="h-10 w-96 animate-pulse rounded-lg bg-[var(--tint-strong)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 h-80 animate-pulse rounded-xl bg-[var(--tint)]" />
          <div className="h-64 animate-pulse rounded-xl bg-[var(--tint)]" />
          <div className="h-64 animate-pulse rounded-xl bg-[var(--tint)]" />
          <div className="h-64 animate-pulse rounded-xl bg-[var(--tint)]" />
          <div className="h-64 animate-pulse rounded-xl bg-[var(--tint)]" />
        </div>
      </div>
    );
  }

  /* ─── Selection Mode (Bento Grid) ─── */
  return (
    <div className="max-w-7xl mx-auto px-8 pb-12 pt-6">
      {/* Page Intro */}
      <div className="mb-12">
        <h2 className="text-4xl font-black tracking-tight text-heading lg:text-5xl">
          Slobodna <span className="text-primary">Vežba</span>
        </h2>
        <p className="mt-2 max-w-lg font-medium text-text-secondary">
          Izaberi oblast ili pojedinačnu temu i vežbaj zadatke uz praćenje napretka po kategorijama.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group, index) => {
          const meta = GROUP_META[group.id] ?? { icon: "functions" };
          const isHero = index === 0; // Algebra is first

          if (isHero) {
            return (
              <section
                key={group.id}
                className="md:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col relative border border-[var(--glass-border)]"
              >
                <div className="p-8 flex-1 flex flex-col relative">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-start gap-4">
                      {meta.image && (<>
                        <img src={meta.image} alt={group.name} className="h-16 w-24 shrink-0 rounded-lg object-cover dark-only" />
                        <img src={meta.imageLight} alt={group.name} className="h-16 w-24 shrink-0 rounded-lg object-cover light-only" />
                      </>)}
                      <div>
                        <h4 className="font-headline text-3xl font-black text-heading mb-1">
                          {group.name}
                        </h4>
                        {meta.description && (
                          <p className="text-text-secondary text-sm max-w-xl">
                            {meta.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ScoreCircle score={group.readinessScore} size={72} />
                  </div>

                  {/* Subcategories grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10 mb-10">
                    {group.categories.map((sub) => (
                      <SubcategoryRow
                        key={sub.id}
                        sub={sub}
                      />
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/zadaci?group=${group.id}`}
                    className="w-full py-4 rounded-lg bg-primary text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined font-black">rocket_launch</span>
                    Pokreni vežbu
                  </Link>
                </div>
              </section>
            );
          }

          /* Standard category card */
          return (
            <section
              key={group.id}
              className="glass-panel rounded-xl p-8 flex flex-col border border-[var(--glass-border)]"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  {meta.image && (<>
                    <img src={meta.image} alt={group.name} className="h-12 w-18 shrink-0 rounded-lg object-cover dark-only" />
                    <img src={meta.imageLight} alt={group.name} className="h-12 w-18 shrink-0 rounded-lg object-cover light-only" />
                  </>)}
                  <h4 className="font-headline text-2xl font-black text-heading">
                    {group.name}
                  </h4>
                </div>
                <ScoreCircle score={group.readinessScore} size={56} />
              </div>

              {/* Subcategories */}
              <div className="flex-1 space-y-5 mb-8">
                {group.categories.map((sub) => (
                  <SubcategoryRow
                    key={sub.id}
                    sub={sub}
                  />
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href={`/zadaci?group=${group.id}`}
                className="w-full py-4 rounded-lg bg-[var(--tint-strong)] text-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[var(--glass-border)] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Pokreni vežbu
              </Link>
            </section>
          );
        })}
      </div>

    </div>
  );
}
