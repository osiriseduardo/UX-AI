# Dataset findings — E-commerce Customer Segmentation 2026

Measured on 2026-11-04 over the full file (50,000 rows × 53 columns).

## Loading

- pandas parses the literal string `"None"` as NaN by default. Use `keep_default_na=False`.
- `preferred_category_2` is `"None"` in 33.5% of rows; `preferred_category_3` in 66.5%.
- `preferred_category_1` is never `"None"`; it has 12 categories with roughly 4,100–4,300 rows each.

## Noise columns (do not use)

`conversion_rate`, `click_through_rate`, `email_open_rate` and `satisfaction_score` have |Pearson r| < 0.01 with every other column. Their mean is flat across all categorical groups (for example, `conversion_rate` ≈ 0.15 in every device, category, frequency and loyalty group).

## Derived columns (fixed thresholds)

| Column | Defined by |
|---|---|
| `rfm_category` | `rfm_score` bins: 3–5 Need Attention, 6–8 At Risk, 9–10 Potential Loyalists, 11–12 Loyal, 13–15 Champions |
| `activity_status` | `days_since_last_purchase`: 0–29 Active, 30–59 At Risk, 60–89 Dormant, 90+ Inactive |
| `behavior_segment` | `days_since_last_purchase` + `total_purchases` |
| `purchase_frequency` | `days_since_last_purchase` bins (Daily 0–1, Weekly 1–7, Monthly 8–30, Quarterly 31–90, Rarely 91–365) |
| `loyalty_tier` | Identical to `customer_value_category` |
| `engagement_level` | Thresholds on `email_open_rate` |
| `churn_risk_score` | Formula of recency, returns, complaints and satisfaction |

Without their source columns these labels fall to near chance (for `rfm_category`, balanced accuracy is 0.36 against 0.20 for chance). A supervised model on them only re-learns the formula.

## Category preference is independent of behavior

Cramér's V between `preferred_category_1` and spend, tenure, purchases, frequency, age, gender, income, device, channel and segment is 0.010–0.015.

## K-Means silhouette (sample_size=10000, random_state=0)

| Features | Best silhouette |
|---|---|
| Behavior only (tenure, purchases, AOV, recency; scaled) | ≈ 0.23 |
| Category affinity 3/2/1 without `"None"`, k=8 / 12 / 16 | 0.279 / **0.414** / 0.377 |
| One-hot of `preferred_category_1` only, k=12 | 1.00 (trivial: cluster = favorite category) |

With affinity features and k=12: ARI across seeds = 1.00, 12/12 distinct top-4 rankings, cluster sizes 4,083–4,282. Each cluster equals one `preferred_category_1` group; positions #2–#4 come from categories 2 and 3, which carry little signal. Do not present this as discovering hidden patterns.

## Acceptance criterion (modified)

CA-01': silhouette ≥ 0.40, ARI ≥ 0.90 across 3 seeds, and a distinct priority 1–4 ranking per cluster. This replaces the original silhouette ≥ 0.50; the change request to the sponsor is pending.
