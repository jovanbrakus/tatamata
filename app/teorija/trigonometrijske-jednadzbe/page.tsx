export default function TrigonometricEquationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Trigonometrijske jednačine</h1>
      <p className="mb-6 text-[#94a3b8]">Pomoćna tema za zadatke sa sin/cos/tan i poznavanje perioda.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovni pristup</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>Svaku jednačinu svedi na oblik sa jednim trigonom. izrazom.</li>
          <li>Koristi identitete i periodičnost: sin(α)=sin(β), cos(α)=cos(β), tan(α)=tan(β).</li>
          <li>Dodaj sve moguće vrednosti u opsegu domašaja (kad je tražen ceo realan, razmisli o višestrukim rešenjima).</li>
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          sin x = 1/2 ⇒ x = π/6 + 2kπ ili x = 5π/6 + 2kπ.
        </p>
      </section>
    </div>
  );
}
