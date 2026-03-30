import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analitika — Matoteka",
  description: "Prati svoj napredak, analiziraj rezultate i identifikuj oblasti za poboljšanje.",
};

export default function AnalitikaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
