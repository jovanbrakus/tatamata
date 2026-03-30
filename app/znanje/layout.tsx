import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lekcije — Matoteka",
  description: "Interaktivne lekcije iz matematike za pripremu prijemnog ispita. Teorija, primeri i objašnjenja.",
};

export default function ZnanjeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
