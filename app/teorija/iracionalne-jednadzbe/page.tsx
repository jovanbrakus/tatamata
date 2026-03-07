export default function IrazonaleJednadzbePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Irracionalne jednačine i nejednačine</h1>
      <p className="mb-6 text-[#94a3b8]">Kod izraza sa korenima ključno je da prvo definišeš domenu i uvodiš supstituciju.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-2 text-xl font-semibold">Radni tok</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>Postavi uslove: izrazi pod korenom moraju biti ≥ 0.</li>
          <li>Izoluj koren (ili više njih) i kvadriraj obe strane.</li>
          <li>Posle kvadriranja proveri rešenja u originalnom izrazu.</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Greške koje se javljaju</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Gubljenje uslova za x (uvodimo lažna rešenja).</li>
          <li>Preuranjeno kvadriranje bez izolacije jednog korena.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          √(x+1) = 2x - 3 ⇒ x≥2, posle kvadriranja: x+1=(2x-3)², dalje standardno.
        </p>
      </section>
    </div>
  );
}
