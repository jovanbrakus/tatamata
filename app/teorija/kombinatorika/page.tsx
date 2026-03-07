export default function KombinatorikaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Kombinatorika</h1>
      <p className="mb-6 text-[#94a3b8]">Odlično za testove gde moraš izračunati broj mogućnosti bez izlistavanja svih slučajeva.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovni izrazi</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Permutacije: P(n, k) = n! / (n-k)!</li>
          <li>Kombinacije: C(n, k) = n! / (k!(n-k)!)</li>
          <li>Proizvodna principa: ukupan broj = m · n · ...</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzo odlučivanje</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Da li redosled bitan? Ako da → permutacije, ako ne → kombinacije.</li>
          <li>Ako se elementi ponavljaju, prilagodi formule.</li>
          <li>Brojačke vežbe uvek proveri granice (n≥k).</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Broj načina da izabereš 2 od 5 bez reda: C(5,2)=10.
        </p>
      </section>
    </div>
  );
}
