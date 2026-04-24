"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { PaperTrade } from "@crypto-signals/shared";

const MAX_TRADES = 100;

export function useRealtimeTrades(initial: PaperTrade[]) {
  const { userId } = useAuth();
  const supabase = useSupabaseClient();
  const [liveTrades, setLiveTrades] = useState<PaperTrade[]>([]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "paper_trades",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as PaperTrade;
          setLiveTrades((prev) => [row, ...prev].slice(0, MAX_TRADES));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return useMemo(() => {
    const merged: PaperTrade[] = [];
    const seen = new Set<PaperTrade["id"]>();

    for (const trade of [...liveTrades, ...initial]) {
      if (seen.has(trade.id)) continue;
      seen.add(trade.id);
      merged.push(trade);
      if (merged.length >= MAX_TRADES) break;
    }

    return merged;
  }, [initial, liveTrades]);
}
