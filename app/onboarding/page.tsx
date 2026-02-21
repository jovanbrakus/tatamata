"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FACULTIES = [
  { id: "etf", name: "Elektrotehnički fakultet (ETF)" },
  { id: "fon", name: "Fakultet organizacionih nauka (FON)" },
  { id: "rgf", name: "Rudarsko-geološki fakultet (RGF)" },
  { id: "matf", name: "Matematički fakultet (MATF)" },
  { id: "masf", name: "Mašinski fakultet" },
  { id: "grf", name: "Građevinski fakultet" },
  { id: "tmf", name: "Tehnološko-metalurški fakultet" },
  { id: "sf", name: "Saobraćajni fakultet" },
  { id: "ff", name: "Fizički fakultet" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (displayName.length < 3 || displayName.length > 20) {
      setError("Ime mora imati između 3 i 20 karaktera.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
      setError("Samo slova, brojevi i donja crta.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, targetFaculty: faculty || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Greška pri čuvanju.");
        return;
      }

      router.push("/zadaci");
    } catch {
      setError("Greška pri čuvanju.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#334155] bg-[#1e293b] p-8"
      >
        <h1 className="mb-2 text-2xl font-bold text-[#e2e8f0]">
          Dobrodošli!
        </h1>
        <p className="mb-6 text-[#94a3b8]">Izaberi korisničko ime i ciljani fakultet.</p>

        <label className="mb-1 block text-sm text-[#94a3b8]">
          Korisničko ime
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-[#e2e8f0] outline-none focus:border-[#60a5fa]"
          placeholder="MatematicarPro"
          maxLength={20}
        />

        <label className="mb-1 block text-sm text-[#94a3b8]">
          Ciljani fakultet (opciono)
        </label>
        <select
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-[#e2e8f0] outline-none focus:border-[#60a5fa]"
        >
          <option value="">— Izaberi —</option>
          {FACULTIES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {error && (
          <p className="mb-4 text-sm text-[#f87171]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#60a5fa] px-6 py-3 font-semibold text-white transition hover:bg-[#3b82f6] disabled:opacity-50"
        >
          {loading ? "Čuvanje..." : "Počni"}
        </button>
      </form>
    </div>
  );
}
