import { Card, CardContent } from "@/components/ui/card";

/**
 * Onboarding banner for first-time visitors. Renders as a friendly
 * "what am I looking at?" card at the top of the dashboard.
 */
export function IntroBanner() {
  return (
    <Card className="border border-blue-500/20 bg-blue-500/5">
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base">👋</span>
          <span className="text-sm font-semibold text-blue-300">
            How to read this dashboard
          </span>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          The cards below show <strong className="text-white">live prices</strong> from
          Coinbase and the model&apos;s <strong className="text-white">prediction</strong> for
          where each coin will be in the next 5 minutes. A green{" "}
          <span className="font-semibold text-green-400">▲ Buy</span> call means
          the model expects the price to go up; red{" "}
          <span className="font-semibold text-red-400">▼ Sell</span> means down;{" "}
          <span className="font-semibold text-white/60">• Wait</span> means the
          model isn&apos;t confident either way. Real money is{" "}
          <strong className="text-white">never</strong> used here — it&apos;s a
          paper-trading simulator. Visit{" "}
          <a href="/model" className="underline text-blue-300 hover:text-blue-200">
            /model
          </a>{" "}
          to see the math behind every call.
        </p>
      </CardContent>
    </Card>
  );
}
