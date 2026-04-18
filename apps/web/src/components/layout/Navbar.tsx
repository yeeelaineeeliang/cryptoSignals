"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7931a] text-white text-sm font-black">
              ₿
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Crypto Signals
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-md px-4 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/portfolio"
                className="rounded-md px-4 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Portfolio
              </Link>
            </Show>
            <Link
              href="/model"
              className="rounded-md px-4 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Model
            </Link>
            <Show when="signed-in">
              <Link
                href="/settings"
                className="rounded-md px-4 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Settings
              </Link>
            </Show>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="lg"
                className="text-base text-white/80 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="text-base bg-[#f7931a] text-white hover:bg-[#d87d10] border-none"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
