export default function TrigonometrijaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Trigonometrija</h1>
      <p className="mb-6 text-[#94a3b8]">Osnova za mnoge geometrijske i analitičke zadatke: ugaoni odnosi i funkcije.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovna pravila</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>sin²x + cos²x = 1.</li>
          <li>tan x = sin x / cos x.</li>
          <li>sin(α±β), cos(α±β) i osnovni uglovi 0°,30°,45°,60°,90°.</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Kako brzo rešavati</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Najpre proveri da li je izraz već u osnovnom obliku.</li>
          <li>Koristi identitet sin²+cos²=1 da smanjiš stepen.</li>
          <li>Odredi kvadrante da bi znao znak funkcije.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          Ako je cos x = 4/5 i x je u I kvadrantu, onda je sin x = 3/5 (pozitivan kvadratni koren). tan x = 3/4.
        </p>
      </section>
    </div>
  );
}
