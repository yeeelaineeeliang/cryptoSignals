# Agents guide

This repo mirrors the NBA scoreboard reference at `../nba-scoreboard/` for the web app patterns. Diverge only when the HW4 spec forces it (primarily: we use a Python Railway worker instead of an Edge Function).

## Conventions

- **Turborepo + pnpm workspaces.** Root scripts: `pnpm dev`, `pnpm build`, `pnpm lint`. Workspace deps use `workspace:^`.
- **Web**: Next.js 16.2.3 (breaking changes vs training data — read `apps/web/node_modules/next/dist/docs/` before touching page/layout/middleware code). React 19. Tailwind v4. shadcn `base-nova` style.
- **Worker**: Python 3.12. Pydantic-settings for env. Structlog JSON logs. APScheduler async.
- **Supabase**: migrations numbered `NNN_name.sql`, applied via Supabase MCP. RLS on everything. Realtime only on the live tables.
- **Clerk**: JWT template named `supabase` (HS256), signed with the Supabase project's JWT secret.

## Things that will bite you

- Binance is geo-blocked in the US. Use Coinbase.
- Coinbase `/candles` returns tuples `[time, low, high, open, close, volume]` — NOT `[time, open, high, low, close, volume]`. Trip hazard.
- Feature-engineering look-ahead: compute features at bar `t` using only bars `≤ t-1`. Target is `log(close_{t+1} / close_t)` — drop the latest bar when training.
- RLS: worker writes use SERVICE_ROLE_KEY (bypasses RLS). Web writes use the Clerk-JWT client (enforces RLS on `auth.jwt()->>'sub'`).
- Do not put SERVICE_ROLE_KEY in web env.

## Reference files worth reading

- `apps/web/src/lib/supabase/client.ts` — the Clerk-JWT injection pattern; do not diverge
- `apps/web/src/hooks/use-realtime-prices.ts` — canonical realtime subscription shape
- `apps/worker/worker/main.py` — scheduler entrypoint; jobs get registered here as phases land
