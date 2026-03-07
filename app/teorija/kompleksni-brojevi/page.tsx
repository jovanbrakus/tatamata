export default function ComplexNumbersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Kompleksni brojevi</h1>
      <p className="mb-6 text-[#94a3b8]">Osnovni gradivni blokovi za zadatke sa √(-1), konjugovanjem i moduo-magnitudom.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-2 text-xl font-semibold">Osnove</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>i² = -1.</li>
          <li>(a+bi)(c+di) = (ac-bd) + (ad+bc)i.</li>
          <li>Konjugovana: (a+bi)·(a−bi)=a²+b² (realan broj).</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzo korišćenje</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Koristi konjugovana kada je kompleksan nazivnik.</li>
          <li>Za jednadžbe sa modulima, često prvo izdvoji realni i imaginarni deo.</li>
          <li>Urealne rezultate proveri kroz uslove problema.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          (1+2i)(1-2i)=1+4=5, čime kompleksni deo nestaje.
        </p>
      </section>
    </div>
  );
}
