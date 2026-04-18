import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { ModelCard } from "@/components/model/ModelCard";
import { Card, CardContent } from "@/components/ui/card";
import type { ModelVersion } from "@crypto-signals/shared";

export const dynamic = "force-dynamic";

export default async function ModelPage() {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from("model_versions")
    .select("*")
    .eq("is_active", true)
    .order("symbol");
  const models = (data ?? []) as ModelVersion[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Behind the predictions
        </h1>
        <p className="mt-3 text-sm text-white/60 max-w-2xl leading-relaxed">
          This page shows{" "}
          <strong className="text-white">exactly how the model thinks</strong>{" "}
          — every signal it considered, which ones it kept, and how confident
          we should be in its calls. If you&apos;ve ever used a paid
          &quot;trading AI&quot; that just shows a buy/sell arrow with no
          explanation, this page is the opposite of that.
        </p>
      </div>

      {/* Plain-English primer */}
      <Card className="border border-blue-500/20 bg-blue-500/5">
        <CardContent className="space-y-3 py-4">
          <h2 className="text-sm font-semibold text-blue-300">
            Reading this page in 30 seconds
          </h2>
          <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
            <li>
              <strong className="text-white">The model is a recipe.</strong> It
              looks at things like recent price changes, trading volume, and
              time of day, and combines them into a single number: &quot;the
              price will probably move +0.04% in the next 5 minutes.&quot;
            </li>
            <li>
              <strong className="text-white">Each &quot;coefficient&quot; is one ingredient.</strong>{" "}
              A bigger number means that ingredient matters more. A
              negative number means it pushes the prediction down.
            </li>
            <li>
              <strong className="text-white">Some ingredients overlap.</strong>{" "}
              Things like &quot;price 5 minutes ago&quot; and &quot;price 10
              minutes ago&quot; carry similar information. The model uses a
              technique called <em>VIF elimination</em> to throw out
              redundant ones automatically — that&apos;s the trim history below.
            </li>
            <li>
              <strong className="text-white">The numbers won&apos;t lie.</strong>{" "}
              If the &quot;test score&quot; is negative, the model is currently
              worse than just guessing the average. That&apos;s shown
              transparently — no spin.
            </li>
          </ul>
        </CardContent>
      </Card>

      {models.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No active models yet — the training script needs to run first.
        </div>
      ) : (
        models.map((model) => <ModelCard key={model.id} model={model} />)
      )}
    </div>
  );
}
