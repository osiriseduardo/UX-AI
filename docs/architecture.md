# Architecture

This is the single source of truth for how UX-AI is built. README, `AGENTS.md` and the agent skills link here instead of repeating it. When the architecture changes, change this file in the same PR.

## What the system does

A demo online store that rearranges its home page for each customer:

1. A **K-Means model** decides **which** categories a customer sees, and in which priority order (#1–#4).
2. A **rule table** decides **how** the home page arranges them: what the Hero highlights and the order of the sections below it.

K-Means is the only machine learning in the project. The layout is deterministic rules, not ML.

## Data flow

```
ml/data/raw/*.csv ──► ml/ (Python, offline) ──► web/public/data/*.json ──► web/ (React, static)
   (git-ignored)      train K-Means, export     (small, committed)          rules + rendering
                              │                         ▲
                              └── validated against ────┘
                                  contracts/artifacts.schema.json
```

- The pipeline runs **offline** on a developer machine. There is no backend server and no network call at runtime.
- The exported JSON files are small (demo-sized) and committed, so the web app builds without the dataset.
- `contracts/artifacts.schema.json` is the contract between `ml/` and `web/`. Changing it updates both sides in the same PR.

## Components

| Component | Responsibility | Stack |
|---|---|---|
| `ml/` | Load the dataset, build features, train K-Means, compute CA-01' metrics, export artifacts | Python 3.12, uv, pandas, scikit-learn, pytest, ruff |
| `contracts/` | JSON schema for the exported artifacts, plus an example file | JSON Schema |
| `web/` | Profile selector, rule engine, responsive store UI, AI notice | pnpm, Vite, React, TypeScript, Vitest, Playwright, axe |
| `docs/` | This file, layout rules, acceptance criteria, dataset findings | Markdown |

### Category model (`ml/`)

- Features: one column per category with weights 3/2/1 for `preferred_category_1/2/3`; `"None"` is excluded.
- Model: `KMeans(n_clusters=12)` with a fixed seed. Each cluster gets a top-4 category ranking.
- Current result: silhouette 0.414, ARI 1.00 across seeds, 12/12 distinct rankings. The project is representative; the team works with these values.
- Details and measurements: [`dataset-findings.md`](dataset-findings.md).
- Planned modules in `ml/src/uxai/`: `load`, `features`, `clustering`, `export`. Notebooks are for EDA only.

### Exported artifacts (`web/public/data/`)

- **Profiles:** 20–50 sample customers, each with its cluster, `activity_status` and `behavior_segment`.
- **Rankings:** the top-4 categories of each cluster.
- **Popularity:** global category order, used by the default view and as the fallback.
- The exact fields are defined in `contracts/artifacts.schema.json`.

### Web app (`web/`)

- `src/domain/`: pure TypeScript, with no React and no I/O. It holds the rule engine `profile → LayoutVariant` and its tests.
- `src/components/`: presentational React components. They call domain functions and never repeat the rules.
- `src/mocks/`: the mock product catalog, grouped by category. The dataset has no products.
- The profile selector offers the four personas from the Figma design (Carlos, Ana, Luis, Sofía) mapped onto exported dataset profiles. The names are display labels only: the rule table still picks every variant. Ana is a guest with no history, so she exercises `DEFAULT_POPULAR` plus the cart reminder.
- Each persona with history gets the first exported profile of its expected variant whose Hero category (its cluster's #1) no other persona shows, counting Ana's default Hero (global popularity #1); only when the export offers no such profile does it fall back to the first match (`assignProfiles` in `src/personas.ts`). This keeps the four Homes visibly different after any re-export.
- Screens:
  - **Home/Dashboard**: arranged by the rules.
  - **Category detail** and **Profile**: fixed layout; only the content changes.
- Must work on desktop and mobile. On mobile it is a single column in the same order.
- Every personalized view shows the AI notice and a "restore default view" control.
- Deployed as a static site on GitHub Pages.

The layout rules and the section order per variant are in [`layout-rules.md`](layout-rules.md).

## Quality

Each acceptance criterion (CA-01'..CA-05) maps to an automated test; see [`acceptance-criteria.md`](acceptance-criteria.md).

The chain CSV → model → committed JSON → UI is tested end to end: `ml/tests/test_export.py` asserts that `web/public/data/` equals a fresh export (skipped without the CSV), `web/src/data/committed-artifacts.test.ts` checks that every exported value has a place in the web app, and `web/e2e/integration-personas.spec.ts` checks that each persona's screen shows its assigned customer, cluster, Hero and ranking. CI runs the ML tests, the web unit tests, the build and the e2e tests on every PR to `develop`.

## Decisions

| Date | Decision |
|---|---|
| 2026-11-04 | K-Means on category affinity only; behavior and demographic columns carry no category signal. |
| 2026-11-04 | Layout by a deterministic rule table instead of a supervised model; the candidate labels are fixed thresholds. |
| 2026-11-04 | CA-01 relaxed to CA-01' (silhouette ≥ 0.40 plus stability and distinct rankings). |
| 2026-11-04 | No Docker dev container and no Makefile. |
| 2026-11-06 | No setup scripts; each developer installs the tools listed in the README. |
| 2026-11-06 | Layout rule table confirmed; it applies only to Home/Dashboard. |
| 2026-11-06 | Products are mock data; the UI is responsive (desktop and mobile). |
| 2026-11-06 | Figma is the design source only, outside the repo; CA-04 navigation is verified in the web app. |
| 2026-11-14 | The UI shows the four Figma personas (Carlos, Ana, Luis, Sofía) as labels over exported profiles; Ana is a guest that demonstrates `DEFAULT_POPULAR` and the cart reminder. No new layout variants. |
| 2026-11-17 | Personas are assigned profiles with distinct Hero categories, so no two personas (guest included) show the same cluster #1. |
