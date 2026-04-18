import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
            Live Paper Trading
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
          A live OLS trading signal,
          <br />
          <span className="text-white/60">built in the open.</span>
        </h1>

        <p className="max-w-3xl text-lg text-white/60 leading-relaxed">
          Coinbase prices, feature-engineered in a Python worker, pruned with
          VIF, served through Supabase Realtime, paper-traded per user — every
          coefficient, every prediction, every trade visible. No black boxes,
          no real money, no promises of alpha.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base">
                Start paper trading
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button size="lg" className="text-base">
                Go to dashboard
              </Button>
            </Link>
          </Show>
          <Link href="/model">
            <Button variant="ghost" size="lg" className="text-base">
              See the model
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3 text-sm text-white/60">
          <div>
            <p className="font-semibold text-white">Background worker</p>
            <p>
              Python on Railway polls Coinbase, computes ~40 features,
              inferences, and simulates trades every 30 seconds.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Real-time</p>
            <p>
              Supabase Realtime pushes price, signal, and trade updates to
              every subscribed client — no refresh needed.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Transparent</p>
            <p>
              The <code>/model</code> page exposes the VIF elimination trace
              and coefficient history. If the model is bad, the numbers say so.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
