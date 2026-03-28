import type { Metadata } from "next";
import PracticeSolver from "@/components/practice/PracticeSolver";

export const metadata: Metadata = {
  title: "Zadaci — Matoteka",
  description: "Rešavaj zadatke iz matematike za prijemni ispit.",
};

export default function ZadaciPage() {
  return <PracticeSolver />;
}
