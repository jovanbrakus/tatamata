"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle, Bot } from "lucide-react";

interface Problem {
  id: string;
  slug: string;
  title: string;
  facultyId: string;
  year: number;
  problemNumber: number;
  correctAnswer: string;
  answerOptions: string[];
  topics: { id: string; name: string }[];
}

export default function ProblemViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 20, remaining: 20 });

  useEffect(() => {
    fetch(`/api/problems/${slug}`)
      .then((r) => r.json())
      .then(setProblem);
    fetch("/api/ai/usage")
      .then((r) => r.json())
      .then(setAiUsage)
      .catch(() => {});
  }, [slug]);

  function checkAnswer() {
    if (!selectedAnswer || !problem) return;
    const isCorrect = selectedAnswer === problem.correctAnswer;
    setAnswerResult(isCorrect ? "correct" : "wrong");
    setShowSolution(true);

    fetch(`/api/progress/${problem.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: selectedAnswer, isCorrect }),
    });
  }

  function skipToSolution() {
    setShowSolution(true);
  }

  async function toggleBookmark() {
    if (!problem) return;
    const res = await fetch(`/api/bookmarks/${problem.id}`, { method: "POST" });
    const data = await res.json();
    setBookmarked(data.bookmarked);
  }

  async function askAi() {
    if (!problem || !aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceProblemId: problem.id,
          contextHint: aiQuestion,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/ai/resenje/${data.id}`);
      }
    } catch {
    } finally {
      setAiLoading(false);
    }
  }

  if (!problem) {
    return <div className="py-20 text-center text-[#94a3b8]">Učitavanje...</div>;
  }

  const FACULTY_LABELS: Record<string, string> = {
    etf: "ETF", fon: "FON", rgf: "RGF", matf: "MATF",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/zadaci" className="mb-4 inline-flex items-center gap-1 text-sm text-[#94a3b8] hover:text-[#60a5fa]">
        <ArrowLeft size={16} /> Nazad na zadatke
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-[#60a5fa]/20 px-2.5 py-0.5 text-xs font-semibold text-[#60a5fa]">
          {FACULTY_LABELS[problem.facultyId] || problem.facultyId.toUpperCase()}
        </span>
        <span className="text-sm text-[#94a3b8]">{problem.year}</span>
        <span className="text-sm text-[#94a3b8]">Zadatak #{problem.problemNumber}</span>
      </div>

      {problem.topics?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {problem.topics.map((t) => (
            <span key={t.id} className="rounded-full bg-[#a78bfa]/20 px-2.5 py-0.5 text-xs text-[#a78bfa]">
              {t.name}
            </span>
          ))}
        </div>
      )}

      <h1 className="mb-6 text-2xl font-bold text-[#e2e8f0]">{problem.title}</h1>

      {/* Answer first section */}
      {!showSolution && (
        <div className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-6">
          <p className="mb-4 text-[#94a3b8]">Probaj da rešiš pre nego što pogledaš rešenje:</p>

          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {(problem.answerOptions as string[]).map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(letter)}
                  className={`rounded-lg border p-3 text-center text-sm transition ${
                    selectedAnswer === letter
                      ? "border-[#60a5fa] bg-[#60a5fa]/20 text-[#60a5fa]"
                      : "border-[#334155] bg-[#0f172a] text-[#e2e8f0] hover:border-[#60a5fa]/50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {answerResult && (
            <p className={`mb-4 text-sm font-medium ${answerResult === "correct" ? "text-[#4ade80]" : "text-[#f87171]"}`}>
              {answerResult === "correct" ? "Tačno!" : `Netačno. Tačan odgovor: (${problem.correctAnswer})`}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="rounded-lg bg-[#60a5fa] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3b82f6] disabled:opacity-50"
            >
              Proveri odgovor
            </button>
            <button
              onClick={skipToSolution}
              className="rounded-lg border border-[#334155] px-6 py-2.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0]"
            >
              Preskoči → Vidi rešenje
            </button>
          </div>
        </div>
      )}

      {/* Solution iframe */}
      {showSolution && (
        <div className="mb-6 overflow-hidden rounded-xl border border-[#334155]">
          <iframe
            src={`/api/problems/${slug}/html`}
            sandbox="allow-scripts allow-same-origin"
            className="h-[80vh] w-full border-none"
            title="Rešenje"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={toggleBookmark}
          className="flex items-center gap-2 rounded-lg border border-[#334155] px-4 py-2 text-sm text-[#94a3b8] hover:text-[#fbbf24]"
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {bookmarked ? "Sačuvano" : "Sačuvaj"}
        </button>
        {!showSolution && (
          <button
            onClick={() => { setShowSolution(true); setAnswerResult(null); }}
            className="flex items-center gap-2 rounded-lg border border-[#334155] px-4 py-2 text-sm text-[#94a3b8]"
          >
            <CheckCircle size={16} /> Označi kao rešen
          </button>
        )}
      </div>

      {/* AI contextual panel */}
      {showSolution && (
        <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#e2e8f0]">
            <Bot size={20} className="text-[#a78bfa]" />
            Pitaj AI o ovom zadatku
          </h3>
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder='Npr: "Objasni mi korak 3 detaljnije" ili "Daj mi sličan zadatak za vežbu"'
            className="mb-3 w-full rounded-lg border border-[#334155] bg-[#0f172a] p-3 text-sm text-[#e2e8f0] outline-none focus:border-[#a78bfa]"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748b]">
              Preostalo danas: {aiUsage.remaining}/{aiUsage.limit}
            </span>
            <button
              onClick={askAi}
              disabled={aiLoading || !aiQuestion.trim() || aiUsage.remaining <= 0}
              className="rounded-lg bg-[#a78bfa] px-5 py-2 text-sm font-medium text-white hover:bg-[#8b5cf6] disabled:opacity-50"
            >
              {aiLoading ? "Generisanje..." : "Pitaj"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
