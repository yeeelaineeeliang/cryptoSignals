import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  const featureCards = [
    {
      title: "Realtime desk",
      copy:
        "Coinbase spot prices stream into a worker that recomputes features and pushes fresh predictions on a tight cadence.",
    },
    {
      title: "Explainable model",
      copy:
        "Every coefficient, the VIF pruning trace, and the backtest-to-live gap are visible. The model is allowed to look imperfect.",
    },
    {
      title: "User-specific simulator",
      copy:
        "Watchlists, thresholds, and paper portfolios are scoped per user, so each desk can run a different risk profile.",
    },
  ];

  const routeCards = [
    {
      href: "/dashboard",
      title: "Dashboard",
      copy: "Track the live tape, the latest calls, and the pairs you actually care about.",
      cta: "Open market view",
    },
    {
      href: "/model",
      title: "Model",
      copy: "Inspect the regression pipeline, the coefficient stack, and the validation trace.",
      cta: "Inspect the model",
    },
    {
      href: "/settings",
      title: "Settings",
      copy: "Tune your watchlist, conviction threshold, and paper capital without touching the worker.",
      cta: "Tune your desk",
    },
  ];

  return (
    <div className="page-shell space-y-6 pt-6 sm:pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="page-hero px-6 py-8 sm:px-8 sm:py-10">
          <span className="page-kicker">Live paper-trading platform</span>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl">
            Crypto signals, styled like a trading control room instead of a
            homework dashboard.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
            Coinbase prices feed a Python worker, features are engineered and
            pruned, predictions stream through Supabase Realtime, and every
            signal lands in a user-scoped paper portfolio. The platform keeps
            the model visible, the data live, and the stakes simulated.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg">
                  Start paper trading
                  <ArrowRight />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg">
                  Open dashboard
                  <ArrowRight />
                </Button>
              </Link>
            </Show>
            <Link href="/model">
              <Button variant="outline" size="lg">
                See the model
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="metric-panel">
              <div className="section-label">Inference cadence</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
                30s
              </div>
              <p className="mt-2 text-sm text-white/56">
                Fresh predictions and simulated trades on a tight worker loop.
              </p>
            </div>
            <div className="metric-panel">
              <div className="section-label">Visibility</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
                Full trace
              </div>
              <p className="mt-2 text-sm text-white/56">
                Coefficients, VIF elimination, and live performance stay
                inspectable.
              </p>
            </div>
            <div className="metric-panel">
              <div className="section-label">Execution mode</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
                Paper only
              </div>
              <p className="mt-2 text-sm text-white/56">
                No capital at risk, but the full flow from signal to trade is
                intact.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c1224]/80 p-5 shadow-[0_28px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-6">
          <div className="absolute inset-x-10 top-0 h-32 rounded-full bg-[radial-gradient(circle,rgba(95,214,199,0.2),transparent_70%)] blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="page-kicker !px-2.5 !py-1 !text-[0.62rem]">
              Control room
            </span>
            <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Feed live
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="section-label">BTC-USD</div>
                  <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white">
                    $68,412
                  </div>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
                  +0.42%
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
                  <div className="section-label">Model call</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    ▲ Buy
                  </div>
                  <p className="mt-1 text-sm text-white/56">
                    Predicted move: +0.117%
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
                  <div className="section-label">Paper fill</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    $10,000
                  </div>
                  <p className="mt-1 text-sm text-white/56">
                    Threshold satisfied, trade simulated.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-label">Latest tape</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    Watched symbols
                  </div>
                </div>
                <div className="text-sm text-white/45">3 active</div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { symbol: "BTC-USD", move: "+0.117%", signal: "Buy", tone: "emerald" },
                  { symbol: "ETH-USD", move: "−0.084%", signal: "Sell", tone: "red" },
                  { symbol: "SOL-USD", move: "+0.012%", signal: "Wait", tone: "white" },
                ].map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-white">{item.symbol}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Live prediction
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={
                          item.tone === "emerald"
                            ? "font-mono text-sm text-emerald-300"
                            : item.tone === "red"
                              ? "font-mono text-sm text-red-300"
                              : "font-mono text-sm text-white/56"
                        }
                      >
                        {item.move}
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {item.signal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <div className="section-label">Platform principle</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{card.copy}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {routeCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 hover:bg-black/25"
          >
            <div className="section-label">Explore</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{card.copy}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#ffd9a8]">
              {card.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
