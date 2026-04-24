"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { Price } from "@crypto-signals/shared";

/**
 * Subscribe to UPDATE/INSERT events on `prices` and keep a local Map keyed
 * by symbol. Mirrors NBA's use-realtime-games pattern — single channel, merge
 * payload.new into state.
 */
export function useRealtimePrices(initialPrices: Price[]) {
  const supabase = useSupabaseClient();
  const [livePrices, setLivePrices] = useState<Map<string, Price>>(
    () => new Map()
  );

  useEffect(() => {
    const channel = supabase
      .channel("prices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prices" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          const updated = payload.new as Price;
          setLivePrices((prev) => {
            const next = new Map(prev);
            next.set(updated.symbol, updated);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return useMemo(() => {
    const next = new Map(initialPrices.map((p) => [p.symbol, p]));

    for (const [symbol, price] of livePrices) {
      next.set(symbol, price);
    }

    return next;
  }, [initialPrices, livePrices]);
}
