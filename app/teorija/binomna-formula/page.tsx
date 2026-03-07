export default function BinomialFormulaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Binomna formula</h1>
      <p className="mb-6 text-[#94a3b8]">Tema se često pojavljuje kao brz način računanja stepenisanih izraza i razvoja izraza sa dve promenljive.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovna formula</h2>
        <p className="text-sm">(a + b)^2 = a² + 2ab + b²</p>
        <p className="mt-2 text-sm">(a - b)^2 = a² - 2ab + b²</p>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Šta se često traži</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Rastav produkta (npr. (x+3)(x-3)).</li>
          <li>Prepoznaj kvadratni oblik i odmah reši bez razvođenja.</li>
          <li>Kombinuj sa zamenskom metodom za teže izraze.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          (x+5)² = x² + 10x + 25.
        </p>
      </section>
    </div>
  );
}
