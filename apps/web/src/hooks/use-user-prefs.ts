"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase/client";
import type { UserPrefs } from "@crypto-signals/shared";

const DEFAULTS: Omit<UserPrefs, "user_id" | "created_at" | "updated_at"> = {
  watched_pairs: ["BTC-USD", "ETH-USD"],
  signal_threshold: 0.002,
  position_size_pct: 0.1,
  short_enabled: false,
};

export function useUserPrefs() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseClient();
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setPrefs(null);
      setLoading(false);
      return;
    }

    // Small delay to ensure Clerk session token is ready
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("user_prefs")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to load user_prefs:", error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        // First-time user: create defaults
        const { data: inserted, error: insertErr } = await supabase
          .from("user_prefs")
          .insert({ user_id: userId, ...DEFAULTS })
          .select("*")
          .single();

        if (insertErr) {
          console.error("Failed to seed user_prefs:", insertErr.message);
        } else {
          setPrefs(inserted as UserPrefs);
        }
      } else {
        setPrefs(data as UserPrefs);
      }
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isSignedIn, userId, supabase]);

  const update = useCallback(
    async (patch: Partial<UserPrefs>) => {
      if (!userId || !prefs) return;

      // Optimistic update
      const optimistic = { ...prefs, ...patch };
      setPrefs(optimistic);

      const { error } = await supabase
        .from("user_prefs")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to update user_prefs:", error.message);
        setPrefs(prefs); // revert
      }
    },
    [userId, prefs, supabase]
  );

  return { prefs, loading, update, isSignedIn: !!isSignedIn };
}
