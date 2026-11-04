---
name: uxai-ml-pipeline
description: "Trigger: UX-AI dataset, preprocessing, EDA, K-Means, clustering, silhouette, category ranking, ml/. Build the category model and export artifacts."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.0"
---

## Activation Contract

Load before reading the dataset or touching `ml/`: preprocessing, EDA, training or tuning K-Means, computing metrics, or exporting artifacts for `web/`.

## Hard Rules

- Read the CSV with `pd.read_csv(path, keep_default_na=False)`. The literal `"None"` in `preferred_category_2/3` is a real value, not NaN.
- Keep the CSV in `ml/data/raw/` and never commit it.
- Cluster on the **category affinity vector** only: weights 3/2/1 for `preferred_category_1/2/3`, one column per category, `"None"` excluded.
- Never cluster on behavioral or demographic columns. They are statistically independent of category preference (Cramér's V ≈ 0.01).
- Never use `conversion_rate`, `click_through_rate`, `email_open_rate` or `satisfaction_score` as targets or signals. They are uniform noise.
- Never train a supervised model on `rfm_category`, `activity_status` or `behavior_segment`. They are fixed thresholds over other columns; the layout uses them through rules instead.
- Use `KMeans(n_clusters=12, n_init>=5, random_state=<fixed>)`.
- CA-01' must hold and be asserted in pytest: silhouette ≥ 0.40 (`sample_size=10000, random_state=0`), ARI ≥ 0.90 across 3 seeds, and a distinct top-4 ranking per cluster. Never lower a threshold to make a test pass.
- Put logic in `ml/src/uxai/`. Notebooks are for EDA only.
- Export only demo-sized artifacts (20–50 profiles plus per-cluster rankings) that validate against `contracts/artifacts.schema.json`. If the schema is missing, stop and ask.

## Decision Gates

| Task | Action |
|---|---|
| New feature or column idea | Check `references/dataset-findings.md` first; noise or derived columns are rejected |
| Metric below a CA-01' threshold | Report the numbers; do not tweak weights to inflate silhouette |
| Contract field needed | Change the schema and the `web/` consumer in the same PR |

## Execution Steps

1. Read `references/dataset-findings.md`.
2. Implement or modify the modules in `ml/src/uxai/` (`load`, `features`, `clustering`, `export`).
3. Add or update pytest tests, including the CA-01' assertions.
4. Run `uv run --project ml pytest` and `uv run --project ml ruff check ml`.
5. Regenerate the artifacts and validate them against the schema.

## Output Contract

Return the files changed, the commands run with their observed results, and the measured silhouette, ARI and number of distinct rankings.

## References

- `references/dataset-findings.md` — verified dataset facts and measurements (2026-11-04).
