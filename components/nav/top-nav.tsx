"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#334155] bg-[#0f172a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Image src="/logo-56.png" alt="TataMata" width={28} height={26} />
          <span className="bg-gradient-to-r from-[#4ade80] to-[#a3e635] bg-clip-text text-transparent">
            TataMata
          </span>
        </Link>

        {pathname !== "/prijava" && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/prijava"
              className="rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-medium text-white hover:bg-[#3b82f6]"
            >
              Prijavi se
            </Link>
          </div>
        )}

        {pathname === "/prijava" && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        )}
      </div>
    </nav>
  );
}
