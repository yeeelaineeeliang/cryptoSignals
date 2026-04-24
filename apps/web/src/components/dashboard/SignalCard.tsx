"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatDollarImpact,
  formatLogretPct,
  formatRelativeTime,
  signalCopy,
} from "@/lib/format";
import type { Pair, Prediction } from "@crypto-signals/shared";

interface SignalCardProps {
  pair: Pair;
  latest: Prediction | undefined;
}

const NOTIONAL = 10_000; // $10k hypothetical position — easy to scale mentally

const BG = {
  up: "bg-emerald-400/10 border-emerald-400/20",
  down: "bg-red-400/10 border-red-400/20",
  flat: "bg-white/[0.04] border-white/10",
} as const;

const TEXT = {
  up: "text-emerald-300",
  down: "text-red-300",
  flat: "text-white/60",
} as const;

export function SignalCard({ pair, latest }: SignalCardProps) {
  const copy = signalCopy(latest?.signal);

  return (
    <Card className={`relative overflow-hidden border ${BG[copy.tone]}`}>
      <div
        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${
          copy.tone === "up"
            ? "from-emerald-400/18 via-transparent to-transparent"
            : copy.tone === "down"
              ? "from-red-400/18 via-transparent to-transparent"
              : "from-white/10 via-transparent to-transparent"
        }`}
      />
      <CardContent className="relative py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="section-label">{pair.symbol}</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              {pair.display_name}
            </h3>
          </div>
          <span
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${BG[copy.tone]} ${TEXT[copy.tone]}`}
          >
            {copy.arrow} {copy.label}
          </span>
        </div>

        <div className={`mt-8 text-5xl font-mono font-bold ${TEXT[copy.tone]}`}>
          {formatLogretPct(latest?.predicted_logret ?? null)}
        </div>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/58">
          {copy.blurb}
        </p>

        {latest && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
              <div className="section-label">Hypothetical impact</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatDollarImpact(latest.predicted_logret, NOTIONAL)}
              </div>
              <p className="mt-1 text-xs text-white/45">on a $10k position</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
              <div className="section-label">Last updated</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatRelativeTime(latest.created_at)}
              </div>
              <p className="mt-1 text-xs text-white/45">latest signal batch</p>
            </div>
          </div>
        )}

        {!latest && (
          <div className="mt-5 rounded-[22px] border border-dashed border-white/15 bg-black/20 px-4 py-4 text-sm text-white/50">
            Waiting for the next prediction cycle.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
