"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { Price } from "@crypto-signals/shared";

/**
 * Subscribe to UPDATE/INSERT events on `prices` and keep a local Map keyed
 * by symbol. Mirrors NBA's use-realtime-games pattern — single channel, merge
 * payload.new into state.
 */
export function useRealtimePrices(initialPrices: Price[]) {
  const supabase = useSupabaseClient();
  const [priceMap, setPriceMap] = useState<Map<string, Price>>(
    () => new Map(initialPrices.map((p) => [p.symbol, p]))
  );

  useEffect(() => {
    setPriceMap(new Map(initialPrices.map((p) => [p.symbol, p])));
  }, [initialPrices]);

  useEffect(() => {
    const channel = supabase
      .channel("prices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prices" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          const updated = payload.new as Price;
          setPriceMap((prev) => {
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

  return priceMap;
}
