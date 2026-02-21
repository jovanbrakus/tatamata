"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Bot } from "lucide-react";

export default function AiHistoryPage() {
  const [solutions, setSolutions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/ai/solutions").then((r) => r.json()).then(setSolutions);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#e2e8f0]">
        <Bot className="mr-2 inline text-[#a78bfa]" size={28} />
        AI Istorija
      </h1>

      {solutions.length === 0 ? (
        <div className="py-20 text-center text-[#94a3b8]">
          <p>Nemaš AI rešenja.</p>
          <Link href="/ai" className="mt-4 inline-block text-[#a78bfa] hover:underline">
            Postavi pitanje AI tutoru
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {solutions.map((s) => (
            <Link
              key={s.id}
              href={`/ai/resenje/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-[#334155] bg-[#1e293b] p-4 transition hover:border-[#a78bfa]/50"
            >
              <div>
                <h3 className="text-sm font-medium text-[#e2e8f0]">{s.title}</h3>
                <p className="text-xs text-[#64748b]">
                  <Clock size={12} className="mr-1 inline" />
                  {new Date(s.createdAt).toLocaleDateString("sr-Latn")}
                  {" · "}
                  {s.contextType === "standalone" ? "Samostalni" : "Kontekstualni"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
