export default function LinearneJednadzbePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Linearne jednačine i nejednačine</h1>
      <p className="mb-6 text-[#94a3b8]">
        Tema ide na gotovo svaki prijemni test. Cilj je da za nekoliko koraka dobijes x.
      </p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-2 text-xl font-semibold">1) Pravimo jednačinu</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Prepoznaj nepoznaticu (najčešće x).</li>
          <li>Prebaci slične članove na jednu stranu.</li>
          <li>Izoluj x deljenjem/imnim množenjem.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Brzi šabloni</h2>
        <div className="space-y-3">
          <p><strong>a(x+b)=c</strong> ⇒ <strong>x=(c/a)-b</strong> ako je a ≠ 0.</p>
          <p><strong>ax+b=cx+d</strong> ⇒ <strong>x=(d-b)/(a-c)</strong> ako je a ≠ c.</p>
          <p><strong>(ax+b)/(c)=d</strong> ⇒ <strong>ax+b=cd</strong>.</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Nejednačine</h2>
        <p className="text-sm text-[#94a3b8]">
          Rad sa znakom nejednačnosti je isti kao kod jednačina, samo pazi:
        </p>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8]">
          <li>pomnožiš li/ podeliš sa pozitivnim brojem, znak ostaje isti;</li>
          <li>pomnožiš li sa negativnim, znak se menja.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Rešiti: <strong>3x + 5 ≤ 2x + 14</strong>.
          <br />
          3x - 2x ≤ 14 - 5 ⇒ x ≤ 9.
        </p>
      </section>
    </div>
  );
}
