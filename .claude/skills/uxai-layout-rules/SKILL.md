---
name: uxai-layout-rules
description: "Trigger: UX-AI layout, layout variant, Hero, rule engine, restore default view, AI notice, responsive Home, web/src/domain. Implement the layout rules."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.1"
---

## Activation Contract

Load before changing how the Home/Dashboard is arranged in `web/`.

## Hard Rules

- The layout engine is a rule table, not ML. Never call or train a model for it.
- Pure TypeScript in `web/src/domain/` (no React, no I/O) with one export: `profile → LayoutVariant`.
- Variants: `OFERTAS_PRIMERO`, `RECOMPRA_PRIMERO`, `EXPLORACION`, `DEFAULT_POPULAR`. Unknown or missing data → `DEFAULT_POPULAR`.
- Rules apply only to Home/Dashboard. Category detail and Profile have a fixed layout.
- The Hero always shows category #1 and takes > 40% of the usable width (CA-03). Variants never move #1 out of the Hero.
- Every personalized view shows the AI notice (WCAG AA) and a "restore default view" control (CA-05).
- Switching profiles makes no network call and finishes in < 1.5 s (CA-02).
- Desktop and mobile; on mobile, single column, same order. Products come from `web/src/mocks/`.
- Components call the domain function; never repeat the rules in JSX.

## Decision Gates

| Situation | Action |
|---|---|
| Segment value not in the table | Return `DEFAULT_POPULAR`; add a test |
| New variant or rule change | Needs team agreement; update `docs/layout-rules.md` and tests in the same PR |

## Execution Steps

1. Read `docs/layout-rules.md`.
2. Write failing Vitest cases for every rule and the fallback.
3. Implement until green, then wire components.
4. Run `pnpm --dir web test` and `pnpm --dir web build`.

## Output Contract

Files changed, rules covered by tests, observed test and build results.
