"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type { Pair, Price } from "@crypto-signals/shared";

interface PriceTickerProps {
  pair: Pair;
  price: Price | undefined;
}

/**
 * One card per watched pair. Flashes green/red briefly on price change so the
 * user gets a visual cue even when the delta is small.
 */
export function PriceTicker({ pair, price }: PriceTickerProps) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(price?.price ?? null);

  useEffect(() => {
    if (price?.price == null) return;
    if (lastPrice != null && price.price !== lastPrice) {
      setFlash(price.price > lastPrice ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    setLastPrice(price.price);
  }, [price?.price, lastPrice]);

  const flashCls =
    flash === "up"
      ? "ring-green-500/60"
      : flash === "down"
        ? "ring-red-500/60"
        : "ring-foreground/10";

  return (
    <Card className={`transition-shadow duration-500 ${flashCls}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{pair.display_name}</span>
          <span className="text-xs font-mono text-muted-foreground">
            {pair.symbol}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-mono font-bold ${
              flash === "up"
                ? "text-green-400"
                : flash === "down"
                  ? "text-red-400"
                  : "text-foreground"
            }`}
          >
            {formatPrice(price?.price)}
          </span>
          {price?.volume_24h != null && (
            <span className="text-xs text-muted-foreground">
              24h vol {Math.round(price.volume_24h).toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Updated {formatRelativeTime(price?.fetched_at)}
        </div>
      </CardContent>
    </Card>
  );
}
