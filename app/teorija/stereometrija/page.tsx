export default function StereometrijaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Stereometrija</h1>
      <p className="mb-6 text-[#94a3b8]">Teme sa zapreminama, površinama i relacijama tela u prostoru.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovna formula set</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>Zapremina valjka: V = πr²h</li>
          <li>Zapremina kocke: V = a³</li>
          <li>Zapremina kugle: V = 4/3 πr³</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Pristup zadatku</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Prvo iscrtaj i označi dimenzije.</li>
          <li>Prepiši koordinate i jedinice (m, cm) u istom sistemu.</li>
          <li>Koristi geometriju preseka i Pitagorin odnos kad god može.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Zapremina valjka sa r=2 i h=5 je V = 4π·5 = 20π.
        </p>
      </section>
    </div>
  );
}
