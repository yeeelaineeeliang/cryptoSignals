"use client";

import { useMemo } from "react";
import { SignalCard } from "./SignalCard";
import { SignalFeed } from "./SignalFeed";
import { useRealtimePredictions } from "@/hooks/use-realtime-predictions";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import type { Pair, Prediction } from "@crypto-signals/shared";

interface SignalsPanelProps {
  pairs: Pair[];
  initialPredictions: Prediction[];
}

/**
 * Client-side composition of SignalCard (latest per pair) + SignalFeed
 * (rolling list). Uses the realtime predictions stream plus the user's
 * watched-pair preferences to filter noise.
 */
export function SignalsPanel({ pairs, initialPredictions }: SignalsPanelProps) {
  const predictions = useRealtimePredictions(initialPredictions);
  const { prefs } = useUserPrefs();

  const watchedSet = useMemo(
    () => new Set(prefs?.watched_pairs ?? pairs.map((p) => p.symbol)),
    [pairs, prefs?.watched_pairs]
  );
  const watchedPairs = useMemo(
    () => pairs.filter((p) => watchedSet.has(p.symbol)),
    [pairs, watchedSet]
  );

  const latestBySymbol = useMemo(() => {
    const m = new Map<string, Prediction>();
    for (const pred of predictions) {
      if (!m.has(pred.symbol)) m.set(pred.symbol, pred);
    }
    return m;
  }, [predictions]);

  if (watchedPairs.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/15 bg-black/20 p-10 text-center text-white/50">
        No watched pairs selected. Adjust your watchlist in{" "}
        <a href="/settings" className="font-medium text-[#ffd9a8] underline">
          Settings
        </a>{" "}
        to surface model calls here.
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
        {watchedPairs.map((pair) => (
          <SignalCard
            key={pair.symbol}
            pair={pair}
            latest={latestBySymbol.get(pair.symbol)}
          />
        ))}
      </div>
      <SignalFeed predictions={predictions} watchedSymbols={watchedSet} />
    </div>
  );
}
