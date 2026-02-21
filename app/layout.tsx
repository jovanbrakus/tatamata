import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/nav/top-nav";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Prijemni — 600+ rešenih zadataka za prijemni ispit",
  description:
    "Besplatna platforma za pripremu prijemnog ispita iz matematike. 600+ rešenih zadataka sa ETF, MATF, FON i drugih fakulteta Univerziteta u Beogradu.",
  keywords: "prijemni ispit, matematika, ETF, MATF, FON, rešeni zadaci, Beograd",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className="min-h-screen">
        <SessionProvider>
          <TopNav />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
