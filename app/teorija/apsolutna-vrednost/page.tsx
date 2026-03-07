export default function AbsoluteValuePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 leading-relaxed text-[#e2e8f0]">
      <h1 className="mb-4 text-3xl font-bold">Apsolutna vrednost</h1>
      <p className="mb-6 text-[#94a3b8]">
        Apsolutna vrednost je jedna od najčešćih tema u nejednačinama i jednačinama na prijemnim ispitima.
      </p>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Definicija</h2>
        <p className="text-sm text-[#94a3b8]">
          |x| = x ako je x ≥ 0, a |x| = −x ako je x&lt;0.
          To znači da moraš podeliti zadatak na slučajeve.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-xl font-semibold">Brzi obrasci</h2>
        <ul className="list-disc pl-5 text-sm text-[#94a3b8] space-y-2">
          <li>|a| = b (b&gt;=0) ⇒ a = b ili a = -b.</li>
          <li>|a| &lt; b (b&gt;0) ⇒ -b &lt; a &lt; b.</li>
          <li>|a| &gt; b (b≥0) ⇒ a &gt; b ili a &lt; -b.</li>
          <li>Za izraz sa više apsolutnih vrednosti razdvoji intervale po nultim tačkama.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
        <h2 className="mb-2 text-lg font-semibold">Primer</h2>
        <p className="text-sm text-[#94a3b8]">
          |x - 3| = 5 ⇒ x - 3 = 5 ili x - 3 = -5 ⇒ x = 8 ili x = -2.
        </p>
      </section>
    </div>
  );
}
