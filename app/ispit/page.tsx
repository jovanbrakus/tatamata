"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Clock, Hash } from "lucide-react";

interface Faculty {
  id: string;
  shortName: string;
  name: string;
  examDuration: number;
  examNumProblems: number;
}

export default function ExamSetupPage() {
  const router = useRouter();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/faculties")
      .then((r) => r.json())
      .then(setFaculties)
      .catch(() => {});
  }, []);

  async function startExam() {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId: selected }),
    });
    const data = await res.json();
    if (data.examId) {
      router.push(`/ispit/${data.examId}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-[#e2e8f0]">
        <ClipboardList className="mr-2 inline" size={28} />
        Probni prijemni ispit
      </h1>
      <p className="mb-8 text-[#94a3b8]">Izaberi fakultet i započni simulaciju prijemnog ispita.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {faculties.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f.id)}
            className={`rounded-xl border p-5 text-left transition ${
              selected === f.id
                ? "border-[#60a5fa] bg-[#60a5fa]/10"
                : "border-[#334155] bg-[#1e293b] hover:border-[#60a5fa]/50"
            }`}
          >
            <h3 className="mb-2 text-lg font-bold text-[#e2e8f0]">{f.shortName}</h3>
            <p className="mb-3 text-xs text-[#94a3b8]">{f.name}</p>
            <div className="flex gap-4 text-xs text-[#64748b]">
              <span className="flex items-center gap-1">
                <Hash size={12} /> {f.examNumProblems} zadataka
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {f.examDuration} min
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[#334155] bg-[#1e293b] p-4 text-sm text-[#94a3b8]">
        Zadaci se nasumično biraju iz baze za izabrani fakultet. Tajmer počinje odmah!
      </div>

      <button
        onClick={startExam}
        disabled={!selected || loading}
        className="mt-6 rounded-xl bg-[#60a5fa] px-8 py-3 text-lg font-semibold text-white hover:bg-[#3b82f6] disabled:opacity-50"
      >
        {loading ? "Pokretanje..." : "Započni ispit"}
      </button>
    </div>
  );
}
