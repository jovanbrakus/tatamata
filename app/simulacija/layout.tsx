import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulacija ispita — Matoteka",
  description: "Simuliraj prijemni ispit iz matematike u realnim uslovima. Odaberi fakultet, vreme i broj zadataka.",
};

export default function SimulacijaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
