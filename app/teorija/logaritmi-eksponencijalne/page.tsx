export default function LogaritmiEksponencijalnaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Logaritmi i eksponencijali</h1>
      <p className="mb-6 text-[#94a3b8]">Tema često izlazi u obliku brzih transformacija izraza i poređenja veličina.</p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Osnovna svojstva</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>log(a·b)=log a + log b</li>
          <li>log(a/b)=log a - log b</li>
          <li>aˣ= b ↔ x=logₐ b</li>
        </ul>
      </section>

      <section className="mb-6 text-sm text-[#94a3b8]">
        <h2 className="mb-2 text-lg font-semibold text-[#e2e8f0]">Brzi trikovi</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Koristi 10ˣ i eˣ osnove gde god može.</li>
          <li>Transformiši logaritamske jednadžbe pre eksplicitnog računanja.</li>
          <li>Logaritamski i eksponencijalni oblik: ln(x)=k ⇒ x=eᵏ.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          log₂ 8 = 3 jer je 2³=8. Ako je 10ˣ=1000, onda je x=3.
        </p>
      </section>
    </div>
  );
}
