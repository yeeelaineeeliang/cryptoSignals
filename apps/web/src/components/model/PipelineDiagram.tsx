/**
 * Visual pipeline of how the model is built.
 * 5 stages, laid out as a process strip.
 */
export function PipelineDiagram() {
  const steps = [
    { step: "01", label: "Coinbase candles", sub: "5-minute OHLCV from the live spot feed" },
    { step: "02", label: "Feature build", sub: "Signal engineering happens before the prediction step" },
    { step: "03", label: "Time split", sub: "Train, validation, and test stay ordered in time" },
    { step: "04", label: "VIF prune", sub: "Redundant inputs get removed before fit and scoring" },
    { step: "05", label: "Serve live", sub: "The active worker refreshes prices, predictions, and trades" },
  ];

  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
        How a model gets built
      </h3>
      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {steps.map((step) => (
          <div
            key={step.label}
            className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.7)]"
          >
            <div className="section-label">{step.step}</div>
            <div className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white">
              {step.label}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/58">
              {step.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
