"use client";

import { useSession, useAuth } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRef, useMemo } from "react";

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
  const { session } = useSession();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await getTokenRef.current({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
