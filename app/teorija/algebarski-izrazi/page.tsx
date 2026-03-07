export default function AlgebraicExpressionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Algebarski izrazi i pojednostavljenja</h1>
      <p className="mb-6 text-[#94a3b8]">
        Ova tema pokriva tipične transformacije izraza sa korenima i razlomcima koje vidiš na prijemnim testovima.
      </p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-2 text-xl font-semibold">Osnovni alati</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8]">
          <li>Skraćivanje zajedničkih faktora pre računanja.</li>
          <li>Faktoracija i korišćenje substitucije (npr. t=√x).</li>
          <li>Racionalizacija imenioca kada treba uporediti brojeve bez korena.</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzi postupak</h2>
        <p className="mb-2">U uvidu zadatka sa deljenjima, prvo uredi „a/b : c/d“ kao „a/b · d/c“.</p>
        <p className="mb-2">Ne zaboravi uslove domene (npr. razlomak i koren).</p>
        <p>Kad se pojavljuje kvadratni član oblika (x-9)/(x+3√x+9) često koristi t=√x.</p>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Ako je t = √x, često se izrazi sa korenima razbiju na (t−3), (t+3), pa iz njih može doći do nulte ili kvadratnog oblika bez grešaka.
        </p>
      </section>
    </div>
  );
}
