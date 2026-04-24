"use client";

import { useUserPrefs } from "@/hooks/use-user-prefs";
import type { Pair } from "@crypto-signals/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PairPickerProps {
  pairs: Pair[];
}

export function PairPicker({ pairs }: PairPickerProps) {
  const { prefs, loading, update } = useUserPrefs();

  if (loading) {
    return <div className="h-64 rounded-[28px] bg-muted/30 animate-pulse" />;
  }

  const watched = new Set(prefs?.watched_pairs ?? []);

  const toggle = (symbol: string) => {
    const next = new Set(watched);
    if (next.has(symbol)) next.delete(symbol);
    else next.add(symbol);
    update({ watched_pairs: [...next] });
  };

  return (
    <Card>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="section-label">Watchlist</div>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Watched pairs
            </CardTitle>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/45">
            {watched.size} selected
          </div>
        </div>
        <CardDescription>
          Pick which trading pairs to surface on your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {pairs.map((pair) => {
            const on = watched.has(pair.symbol);
            return (
              <button
                key={pair.symbol}
                type="button"
                onClick={() => toggle(pair.symbol)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  on
                    ? "border-amber-400/25 bg-amber-400/12 text-[#ffd9a8]"
                    : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {pair.display_name}{" "}
                <span className="font-mono opacity-60">{pair.symbol}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
