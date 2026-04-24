"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLogretPct, formatRelativeTime, signalCopy } from "@/lib/format";
import type { Prediction } from "@crypto-signals/shared";

interface SignalFeedProps {
  predictions: Prediction[];
  watchedSymbols: Set<string>;
}

const TONE = {
  up: "text-emerald-300",
  down: "text-red-300",
  flat: "text-white/55",
} as const;

export function SignalFeed({ predictions, watchedSymbols }: SignalFeedProps) {
  const filtered = predictions.filter((p) => watchedSymbols.has(p.symbol));
  const show = filtered.slice(0, 15);

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="section-label">Recent sequence</div>
            <CardTitle className="mt-2 text-2xl font-semibold text-white">
              Recent calls
            </CardTitle>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/45">
            {show.length} shown
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {show.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/50">waiting…</div>
        ) : (
          <div className="space-y-2">
            {show.map((p) => {
              const copy = signalCopy(p.signal);
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm"
                >
                  <span className="w-14 text-xs font-mono text-white/35">
                    {formatRelativeTime(p.created_at)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{p.symbol}</div>
                    <div className="truncate text-xs text-white/45">
                      {copy.blurb}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono ${TONE[copy.tone]}`}>
                      {formatLogretPct(p.predicted_logret)}
                    </div>
                    <div className={`font-bold ${TONE[copy.tone]}`}>
                      {copy.arrow} {copy.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
