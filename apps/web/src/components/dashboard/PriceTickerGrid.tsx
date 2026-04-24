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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pairs.map((p) => (
          <div
            key={p.symbol}
            className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (watched.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/15 bg-black/20 p-10 text-center text-white/50">
        No pairs selected. Head to{" "}
        <a href="/settings" className="font-medium text-[#ffd9a8] underline">
          Settings
        </a>{" "}
        to pick one.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
