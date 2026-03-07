export default function SequencesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Nizovi</h1>
      <p className="mb-6 text-[#94a3b8]">Nizovi se često javljaju kao formula sa indeksom i traži se n-ti član.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Ključno</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>Arimetički niz: aₙ = a₁ + (n−1)d</li>
          <li>Geometrijski niz: aₙ = a₁·q^(n−1)</li>
          <li>Prepoznaj da li rast je linearan ili eksponencijalan.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Ako je a₁=3, d=2, onda je a₅=11.
        </p>
      </section>
    </div>
  );
}
