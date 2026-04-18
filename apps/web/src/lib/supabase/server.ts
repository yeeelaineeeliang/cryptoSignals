import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function createServerSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
