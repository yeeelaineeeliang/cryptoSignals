"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { WorkerHealthBadge } from "@/components/layout/WorkerHealthBadge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", signedInOnly: true },
  { href: "/portfolio", label: "Portfolio", signedInOnly: true },
  { href: "/model", label: "Model", signedInOnly: false },
  { href: "/settings", label: "Settings", signedInOnly: true },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLink = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={cn(
          "rounded-full px-3 py-2 text-sm font-medium transition-colors",
          isHome
            ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            : "text-white/62 hover:bg-white/[0.06] hover:text-white",
          active &&
            (isHome
              ? "bg-white text-slate-950 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)]"
              : "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]")
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="page-shell">
        <div
          className={cn(
            "rounded-[28px] px-4 py-3 backdrop-blur-xl sm:px-5",
            isHome
              ? "border border-slate-200/80 bg-white/88 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)]"
              : "border border-white/10 bg-[#0f1527]/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.95)]"
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="mr-2 flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(255,195,92,1),rgba(255,132,58,0.92))] text-sm font-black text-slate-950 shadow-[0_18px_30px_-20px_rgba(255,152,63,0.85)]">
                CS
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "truncate text-sm font-semibold uppercase tracking-[0.24em]",
                    isHome ? "text-amber-600" : "text-[#ffd9a8]"
                  )}
                >
                  Crypto Signals
                </div>
                <div
                  className={cn(
                    "truncate text-xs",
                    isHome ? "text-slate-500" : "text-white/42"
                  )}
                >
                  Live model desk for paper trading
                </div>
              </div>
            </Link>

            <nav className="order-3 flex basis-full flex-wrap items-center gap-1 md:order-none md:basis-auto">
              <Show when="signed-in">
                {NAV_ITEMS.filter((item) => item.signedInOnly).map((item) => (
                  <span key={item.href}>{navLink(item.href, item.label)}</span>
                ))}
              </Show>
              {NAV_ITEMS.filter((item) => !item.signedInOnly).map((item) => (
                <span key={item.href}>{navLink(item.href, item.label)}</span>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <WorkerHealthBadge />
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      isHome
                        ? "border border-slate-200 bg-white/70 text-slate-700 hover:bg-white hover:text-slate-950"
                        : "text-white/78"
                    )}
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="lg">Start Trading</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div
                  className={cn(
                    "rounded-full p-1",
                    isHome
                      ? "border border-slate-200 bg-white/70"
                      : "border border-white/10 bg-white/[0.04]"
                  )}
                >
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
