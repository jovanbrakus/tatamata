export default function QuadraticFunctionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Kvadratna funkcija</h1>
      <p className="mb-6 text-[#94a3b8]">Skratka za zadatke gde pomaže pregled vrha, nultočki i znaka funkcije.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Oblik i vrh</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>f(x)=ax²+bx+c, a≠0</li>
          <li>Vrh: x₀= -b/(2a), y₀ = f(x₀)</li>
          <li>Parabola je otvorena nagore ako je a>0, nadole ako je a<0.</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzo rešavanje</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Najpre odredi diskriminantu D=b²-4ac da znaš broj nultočaka.</li>
          <li>Za nejednačine, koristi intervale oko nultočaka.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          f(x)=-(x-2)²+9 ima maksimum 9 u x=2 i uvek je ≤ 9.
        </p>
      </section>
    </div>
  );
}
