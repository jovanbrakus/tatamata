export default function ExponentialEquationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Eksponencijalne jednačine</h1>
      <p className="mb-6 text-[#94a3b8]">Rešavaju se prelaskom na isti osnove ili logaritmovanjem.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-2 text-xl font-semibold">Osnovna ideja</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>Iskazuj sve izraze kao aˣ sa istim osnovom ako je moguće.</li>
          <li>Upotrebi logaritme kad se osnove ne poklapaju.</li>
          <li>Prati domen (osnove >0 i ≠1).</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzi primer postupka</h2>
        <p>2^(x+1)=8 ⇒ 2·2^x=2^3 ⇒ 2^x=4 ⇒ x=2.</p>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Provera</h2>
        <p className="text-sm text-[#94a3b8]">
          Uvek vrati rezultat u originalnu jednačinu da izbegneš algebarske greške kod logaritama.
        </p>
      </section>
    </div>
  );
}
