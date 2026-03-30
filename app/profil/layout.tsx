import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — Matoteka",
  description: "Upravljaj svojim profilom, podesi ciljeve i odaberi fakultete za pripremu.",
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
