"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Sidebar from "./sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthenticatedLayoutProps {
  user: { displayName: string; avatarUrl: string | null };
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  user,
  children,
}: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Full-screen pages (simulation active + start dialog) use fixed overlays
  // that cover the sidebar. The sidebar renders but is visually hidden.
  // Onboarding doesn't need sidebar.
  const skipSidebar = pathname === "/onboarding";

  if (skipSidebar) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0a0a0a]"
      style={{
        background:
          "radial-gradient(circle at 50% -20%, #2a1a12 0%, #0a0a0a 100%)",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar user={user} />
      </div>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-56.png" alt="TataMata" width={24} height={22} />
          <span className="text-lg font-bold">
            Tata<span className="text-[#4ade80]">Mata</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative h-full w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              user={user}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
