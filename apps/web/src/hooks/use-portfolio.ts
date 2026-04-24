"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { Portfolio } from "@crypto-signals/shared";

interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  userId: string | null;
}

export function usePortfolio() {
  const { userId, isSignedIn } = useAuth();
  const supabase = useSupabaseClient();
  const isActiveUser = Boolean(isSignedIn && userId);
  const [state, setState] = useState<PortfolioState>({
    portfolio: null,
    loading: isActiveUser,
    userId: userId ?? null,
  });

  // Initial fetch
  useEffect(() => {
    if (!isActiveUser || !userId) return;

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      setState({
        portfolio: (data as Portfolio) ?? null,
        loading: false,
        userId,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isActiveUser, userId, supabase]);

  // Realtime subscription — worker updates this row on every trade
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("portfolio-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "portfolios",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setState({
            portfolio: payload.new as Portfolio,
            loading: false,
            userId,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portfolios",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setState({
            portfolio: payload.new as Portfolio,
            loading: false,
            userId,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const resetPortfolio = async (startingCapital: number) => {
    if (!userId) return;
    const { data } = await supabase
      .from("portfolios")
      .upsert({
        user_id: userId,
        starting_capital: startingCapital,
        cash_usd: startingCapital,
        positions: {},
        equity_usd: startingCapital,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (data) {
      setState({
        portfolio: data as Portfolio,
        loading: false,
        userId,
      });
    }
  };

  const loading = isActiveUser ? state.userId !== userId || state.loading : false;
  const portfolio =
    isActiveUser && state.userId === userId ? state.portfolio : null;

  return { portfolio, loading, resetPortfolio };
}
