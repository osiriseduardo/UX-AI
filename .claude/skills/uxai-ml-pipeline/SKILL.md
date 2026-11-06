---
name: uxai-ml-pipeline
description: "Trigger: UX-AI dataset, preprocessing, EDA, K-Means, clustering, silhouette, category ranking, ml/. Build the category model and export artifacts."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.1"
---

## Activation Contract

Load before reading the dataset or changing `ml/`.

## Hard Rules

- Read the CSV with `pd.read_csv(path, keep_default_na=False)`; `"None"` is a real value.
- Keep the CSV in `ml/data/raw/` (git-ignored).
- Features: category affinity only (weights 3/2/1, `"None"` excluded). Never cluster on behavior or demographics.
- Never use `conversion_rate`, `click_through_rate`, `email_open_rate` or `satisfaction_score`: they are noise.
- Never train a supervised model on `rfm_category`, `activity_status` or `behavior_segment`.
- `KMeans(n_clusters=12, n_init>=5, random_state=<fixed>)`.
- Assert CA-01' in pytest: silhouette ≥ 0.40 (`sample_size=10000, random_state=0`), ARI ≥ 0.90 across 3 seeds, distinct top-4 per cluster. Never lower a threshold.
- Logic in `ml/src/uxai/`; notebooks only for EDA.
- Artifacts go to `web/public/data/` and must validate against `contracts/artifacts.schema.json`. If the schema is missing, stop and ask.

## Decision Gates

| Situation | Action |
|---|---|
| New feature idea | Check `docs/dataset-findings.md`; reject noise or derived columns |
| Metric below threshold | Report the numbers; do not tune weights to inflate it |

## Execution Steps

1. Read `docs/dataset-findings.md`; read `docs/architecture.md` only if you change structure.
2. Change `ml/src/uxai/` and its tests.
3. Run `uv run --project ml pytest` and `uv run --project ml ruff check ml`.
4. Regenerate and validate the artifacts.

## Output Contract

Files changed, commands with observed results, measured silhouette, ARI and distinct rankings.
