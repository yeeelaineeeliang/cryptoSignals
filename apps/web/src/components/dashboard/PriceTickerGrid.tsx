"use client";

import { useMemo } from "react";
import { PriceTicker } from "./PriceTicker";
import { useRealtimePrices } from "@/hooks/use-realtime-prices";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import type { Pair, Price } from "@crypto-signals/shared";

interface PriceTickerGridProps {
  pairs: Pair[];
  initialPrices: Price[];
}

export function PriceTickerGrid({ pairs, initialPrices }: PriceTickerGridProps) {
  const priceMap = useRealtimePrices(initialPrices);
  const { prefs, loading } = useUserPrefs();

  const watched = useMemo(() => {
    const watchedSet = new Set(prefs?.watched_pairs ?? pairs.map((p) => p.symbol));
    return pairs.filter((p) => watchedSet.has(p.symbol));
  }, [pairs, prefs?.watched_pairs]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((p) => (
          <div key={p.symbol} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (watched.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
        No pairs selected. Head to{" "}
        <a href="/settings" className="underline text-foreground">
          Settings
        </a>{" "}
        to pick one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {watched.map((pair) => (
        <PriceTicker
          key={pair.symbol}
          pair={pair}
          price={priceMap.get(pair.symbol)}
        />
      ))}
    </div>
  );
}
