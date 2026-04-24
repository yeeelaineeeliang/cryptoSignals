"use client";

import { useAuth } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

/**
 * Supabase client bound to the Clerk session.
 *
 * On every request, the `supabase`-template JWT is fetched from Clerk and
 * injected as a Bearer header. Supabase verifies the HS256 signature against
 * its own JWT secret. RLS policies then evaluate `auth.jwt() ->> 'sub'`.
 *
 * Mirrors the NBA scoreboard reference — do not diverge without reason.
 */
export function useSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();

  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken({
              template: "supabase",
            });

            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }

            return fetch(url, { ...options, headers });
          },
        },
      }
    );
  }, [getToken]);
}
