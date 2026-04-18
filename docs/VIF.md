# VIF & Multicollinearity — Refresher

Variance Inflation Factor is the diagnostic we lean on to keep the OLS model interpretable as we refit it on rolling windows. This page exists so the `ml/bootstrap_train.py` elimination loop isn't black magic — you should be able to explain every step in an interview.

## What multicollinearity is

Two or more predictors carrying overlapping information. For OHLCV this is extreme:

- `open`, `high`, `low`, `close` of the same bar are mechanically constrained: `low ≤ open, close ≤ high`.
- On quiet bars they're nearly identical floats.
- `volume` and `trade_count` move together — more trades generally means more volume.
- `sma_5` and `sma_20` both live near `close`, especially in trending regimes.

## Why it hurts OLS

The coefficient covariance matrix for OLS is `σ² (XᵀX)⁻¹`. When predictors are collinear, `XᵀX` is near-singular, so its inverse explodes. Practical symptoms:

1. **Unstable coefficients.** Estimates flip signs across bootstraps or after a single-row change.
2. **Inflated standard errors.** Individually significant variables appear insignificant; the model can be globally significant (high R², high F-statistic) while every `t`-statistic is near zero.
3. **Interpretation breaks.** "Which feature matters?" has no defensible answer.

**The forecast itself is not directly hurt** when the new data matches the training regime — the fitted hyperplane is still fine. But:

- Coefficient instability across **periodic refits** (we refit every 6h) causes the live system to change behavior unpredictably.
- After a **regime shift**, collinear feature relationships can break; the model then generalizes worse than a cleaner one would.
- You lose the ability to talk about feature importance with any credibility.

## What VIF measures

For predictor `j`, regress `xⱼ` on all the other predictors. Call that auxiliary R² `Rⱼ²`. Then

```
VIF_j = 1 / (1 - Rⱼ²)
```

Read it as: "the variance of the fitted coefficient `β_j` is inflated by a factor of `VIF_j` relative to an orthogonal-features world."

| VIF | Rⱼ² | Interpretation |
|-----|-----|----------------|
| 1   | 0    | perfectly orthogonal |
| 5   | 0.80 | yellow flag — 80% of `xⱼ` is explained by others |
| 10  | 0.90 | red flag — conventional "drop it" threshold |

In `statsmodels`:

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor
X_with_const = sm.add_constant(X)         # REQUIRED or the numbers lie
vif = [variance_inflation_factor(X_with_const.values, i)
       for i in range(X_with_const.shape[1])]
```

## Our elimination loop

Implemented in `apps/worker/worker/ml/train.py` and exercised explicitly by `bootstrap_train.py`:

1. Fit the standardizer (z-score) on the **training fold only**. Transform train/validation/test with those stats.
2. Compute VIF for every feature. Sort descending.
3. Fit OLS. Record `train R², val R², val OSR², val hit rate, val RMSE`.
4. Decision tree:
   - `max VIF > 10` → drop unconditionally.
   - `5 < max VIF ≤ 10` → drop only if removing that feature degrades val OSR² by ≤ 0.005.
   - `max VIF ≤ 5` → STOP.
5. Refit on reduced set. Goto 2.
6. Stop also if: val OSR² would drop by > 0.01 from any further removal, or < 3 features remain.
7. Persist `selected_features`, `coefficients`, `scaler_means/stds`, and the full `vif_trace` into `model_versions`.

The `/model` page reads `vif_trace` JSONB and renders the elimination story — which feature got dropped when, how VIF changed, how OSR² tracked along with it.

## Limitations (say these out loud in interviews)

1. **Only linear collinearity.** `x` and `x²` can have low VIF yet be functionally identical. VIF won't save you from kernel-level redundancy.
2. **Scaling-sensitive.** Compute VIF on standardized features; comparing VIF of raw `volume` (billions) and `rsi_14` (bounded [0,100]) is meaningless.
3. **Training-sample diagnostic.** A feature can have low training VIF and become collinear after a regime shift. Our 6h refit re-runs VIF to catch this; if a live regime shift persists longer than a refit cycle, coefficient instability is expected and the `/model` page's confusion matrix will show it.
4. **Domain theory can override.** Don't drop a feature you need for economic reasons just because VIF says so. Omitted-variable bias is usually worse than inflated standard errors.

## What the feature set looks like (Coinbase-constrained)

Starting pool, grouped by intent:

- **Group A raw OHLCV**: open, high, low, close, volume, trade_count (6 features)
- **Group B log transforms**: log1p(volume), log1p(trade_count), log(close) (3)
- **Group C returns & bar shape**: ret, logret, range_pct, body_pct, wick_upper_pct, wick_lower_pct (6)
- **Group D MA & ratios**: sma_5, sma_20, sma_50, ema_12, ema_26, close/sma_20, sma_5/sma_20 (7)
- **Group E volatility**: vol_20, vol_50, atr14_proxy, vol_ratio (4)
- **Group F momentum/oscillators**: rsi_14, momentum_10, momentum_50, macd_hist (4)
- **Group G volume flow**: vol_z_20, count_z_20, volume_per_trade, volume_change (4)
- **Group H calendar**: hour_sin, hour_cos, dow_sin, dow_cos (4)
- **Group I lags**: logret_lag_1, logret_lag_3, logret_lag_12 (3)

Total: ~41 candidate features. The old project started with 9 and converged to 2 — too small to really exercise VIF's regularization effect. 41 produces a long elimination trace that's actually informative.

## Expected outcome (not a promise)

VIF usually drops:
- All raw OHLCV level features (Group A) — they're ~100% collinear with `close` and each other.
- Raw SMAs (Group D) — dominated by `close`.
- `log1p(volume)` if `log1p(trade_count)` is kept (redundant).
- One of `{vol_20, vol_50}` — both measure the same thing.

VIF usually keeps: `logret` lags, `rsi_14`, `close_over_sma20`, one volatility feature, volume z-score, and calendar features. Exact survivors depend on the window; refit re-runs VIF every cycle.
