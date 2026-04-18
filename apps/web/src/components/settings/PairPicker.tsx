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
    return <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />;
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
      <CardHeader>
        <CardTitle>Watched pairs</CardTitle>
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
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:bg-muted"
                }`}
              >
                {pair.display_name}{" "}
                <span className="opacity-60 font-mono">{pair.symbol}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
