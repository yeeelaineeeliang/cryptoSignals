// Placeholder for Phase 2: displays active model version + coefficient chart
// + VIF elimination trace. For Phase 1 this is just a coming-soon page so
// the Navbar link doesn't 404.

export const dynamic = "force-static";

export default function ModelPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-white">Model</h1>
      <p className="mt-4 text-white/50">
        Coming soon — VIF elimination trace, coefficients, hit rate, backtest-vs-live
        performance comparison.
      </p>
    </div>
  );
}
