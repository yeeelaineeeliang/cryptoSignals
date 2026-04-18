"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatLogretPct,
  formatPrice,
  formatRelativeTime,
  signalCopy,
} from "@/lib/format";
import type { Prediction } from "@crypto-signals/shared";

interface SignalFeedProps {
  predictions: Prediction[];
  watchedSymbols: Set<string>;
}

const ROW_TONE = {
  up: "text-green-400",
  down: "text-red-400",
  flat: "text-white/50",
} as const;

export function SignalFeed({ predictions, watchedSymbols }: SignalFeedProps) {
  const filtered = predictions.filter((p) => watchedSymbols.has(p.symbol));
  const show = filtered.slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent calls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {show.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No calls yet. The model checks the market every 30 seconds — this
            list will fill in shortly.
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>When</span>
              <span>Coin</span>
              <span className="text-right">Predicted change</span>
              <span className="text-right">Price now</span>
              <span className="text-right">Call</span>
            </div>
            {show.map((p) => {
              const copy = signalCopy(p.signal);
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 py-2"
                >
                  <span className="text-muted-foreground font-mono">
                    {formatRelativeTime(p.created_at)}
                  </span>
                  <span className="font-semibold">{p.symbol}</span>
                  <span className={`text-right font-mono ${ROW_TONE[copy.tone]}`}>
                    {formatLogretPct(p.predicted_logret)}
                  </span>
                  <span className="text-right text-muted-foreground font-mono">
                    {formatPrice(p.current_price)}
                  </span>
                  <span className={`text-right font-semibold ${ROW_TONE[copy.tone]}`}>
                    {copy.arrow} {copy.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
