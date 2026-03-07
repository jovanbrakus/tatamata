export default function KvadratneJednadzbePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Kvadratne jednačine</h1>
      <p className="mb-6 text-[#94a3b8]">Kvadratna jednačina tipa <strong>ax² + bx + c = 0</strong> (a ≠ 0) rešava se najbrže preko diskriminante.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Formula</h2>
        <p className="text-sm">D = b² - 4ac</p>
        <p className="mt-2 text-sm">x = (-b ± √D) / (2a)</p>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzi oglasi</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>D &lt; 0 nema realnih rešenja.</li>
          <li>D = 0 postoji jedno dvostruko rešenje.</li>
          <li>D &gt; 0 dva rešenja.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Trikovi</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Brzo uočavanje da je kvadratni oblik (x ± a)(x ± b)=0.</li>
          <li>U zadacima bez c često koristiš X = -c.</li>
          <li>Ako je koeficijent velik, prvo podeli jednačinu deliteljima da smanjiš grešku.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          x² - 5x + 6 = 0 ⇒ (x-2)(x-3)=0 ⇒ x=2 ili x=3.
        </p>
      </section>
    </div>
  );
}
