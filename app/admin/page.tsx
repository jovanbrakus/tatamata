"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, BookOpen, Settings } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#e2e8f0]">
        <Settings className="mr-2 inline" size={28} />
        Admin Dashboard
      </h1>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-5">
            <Users className="mb-2 text-[#60a5fa]" size={20} />
            <div className="text-2xl font-bold text-[#e2e8f0]">{stats.totalUsers}</div>
            <div className="text-xs text-[#94a3b8]">Korisnika</div>
          </div>
          <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-5">
            <BookOpen className="mb-2 text-[#a78bfa]" size={20} />
            <div className="text-2xl font-bold text-[#e2e8f0]">{stats.totalProblems}</div>
            <div className="text-xs text-[#94a3b8]">Zadataka</div>
          </div>
          <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-5">
            <BarChart3 className="mb-2 text-[#4ade80]" size={20} />
            <div className="text-2xl font-bold text-[#e2e8f0]">{stats.totalExams}</div>
            <div className="text-xs text-[#94a3b8]">Ispita ukupno</div>
          </div>
          <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-5">
            <BarChart3 className="mb-2 text-[#f472b6]" size={20} />
            <div className="text-2xl font-bold text-[#e2e8f0]">{stats.totalAiSolutions}</div>
            <div className="text-xs text-[#94a3b8]">AI rešenja</div>
          </div>
        </div>
      )}

      <p className="text-[#94a3b8]">Detaljniji admin panel dolazi u sledećoj verziji.</p>
    </div>
  );
}
