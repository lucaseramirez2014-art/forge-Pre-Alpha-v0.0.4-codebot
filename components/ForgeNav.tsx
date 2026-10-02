"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/campaign", label: "Campaign" },
];

export function ForgeNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/7 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/dashboard" className="group flex items-center gap-2.5" aria-label="FORGE dashboard">
          <span className="grid size-8 place-items-center rounded-lg bg-orange-500 text-sm font-black text-stone-950 shadow-lg shadow-orange-900/20">F</span>
          <span className="text-sm font-bold tracking-[0.2em] text-stone-100">FORGE</span>
        </Link>
        <div className="flex items-center gap-1 rounded-xl border border-white/7 bg-white/[0.025] p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${active ? "bg-white/10 text-white" : "text-stone-500 hover:text-stone-200"}`}>
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link href="/focus" className="hidden rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-stone-950 transition hover:bg-orange-400 sm:block">Start focus</Link>
      </nav>
    </header>
  );
}
