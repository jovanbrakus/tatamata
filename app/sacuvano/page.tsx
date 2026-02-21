"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/bookmarks").then((r) => r.json()).then(setBookmarks);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#e2e8f0]">
        <Bookmark className="mr-2 inline text-[#fbbf24]" size={28} />
        Sačuvani zadaci
      </h1>

      {bookmarks.length === 0 ? (
        <div className="py-20 text-center text-[#94a3b8]">
          <p>Nemaš sačuvanih zadataka.</p>
          <Link href="/zadaci" className="mt-4 inline-block text-[#60a5fa] hover:underline">
            Pretraži zadatke
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => (
            <Link
              key={b.problemId}
              href={`/zadaci/${b.slug}`}
              className="flex items-center justify-between rounded-xl border border-[#334155] bg-[#1e293b] p-4 transition hover:border-[#60a5fa]/50"
            >
              <div>
                <h3 className="text-sm font-medium text-[#e2e8f0]">{b.title}</h3>
                <p className="text-xs text-[#94a3b8]">
                  {b.facultyId?.toUpperCase()} {b.year} · Zadatak #{b.problemNumber}
                </p>
              </div>
              <Bookmark size={16} className="text-[#fbbf24]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
