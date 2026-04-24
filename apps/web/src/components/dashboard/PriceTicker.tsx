"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  const lastPrice = useRef<number | null>(price?.price ?? null);

  useEffect(() => {
    if (price?.price == null) return;
    if (lastPrice.current != null && price.price !== lastPrice.current) {
      setFlash(price.price > lastPrice.current ? "up" : "down");
      lastPrice.current = price.price;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    lastPrice.current = price.price;
  }, [price?.price]);

  const flashCls =
    flash === "up"
      ? "border-emerald-400/30 shadow-[0_28px_90px_-52px_rgba(16,185,129,0.28)]"
      : flash === "down"
        ? "border-red-400/30 shadow-[0_28px_90px_-52px_rgba(239,68,68,0.22)]"
        : "border-white/10";

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 ${flashCls}`}>
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${
          flash === "up"
            ? "from-emerald-400/16 via-transparent to-transparent"
            : flash === "down"
              ? "from-red-400/16 via-transparent to-transparent"
              : "from-cyan-300/16 via-transparent to-transparent"
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
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/45">
            Spot
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <span
              className={`text-4xl font-mono font-bold ${
                flash === "up"
                  ? "text-emerald-300"
                  : flash === "down"
                    ? "text-red-300"
                    : "text-white"
              }`}
            >
              {formatPrice(price?.price)}
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {price?.volume_24h != null && (
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/58">
                  24h vol {Math.round(price.volume_24h).toLocaleString()}
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/58">
                Updated {formatRelativeTime(price?.fetched_at)}
              </span>
            </div>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-[20px] border ${
              flash === "up"
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : flash === "down"
                  ? "border-red-400/25 bg-red-400/10 text-red-300"
                  : "border-white/10 bg-black/20 text-white/52"
            }`}
          >
            <span className="text-xl font-semibold">
              {flash === "up" ? "↗" : flash === "down" ? "↘" : "•"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
