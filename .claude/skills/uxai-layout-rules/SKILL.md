---
name: uxai-layout-rules
description: "Trigger: UX-AI layout, layout variant, Hero, rule engine, restore default view, AI notice, web/src/domain. Implement the deterministic layout rules."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.0"
---

## Activation Contract

Load before changing how the dashboard is arranged: the layout variants, the segment → layout table, Hero placement, the restore-default toggle, the AI transparency notice, or profile switching in `web/`.

## Hard Rules

- The layout engine is a deterministic rule table, not ML. Never call or train a model for it.
- Keep it as pure TypeScript in `web/src/domain/` (no React, no fetch, no globals), with one exported function: `profile → LayoutVariant`.
- Allowed variants: `OFERTAS_PRIMERO`, `RECOMPRA_PRIMERO`, `EXPLORACION`, `DEFAULT_POPULAR`.
- Missing, null or unknown segment data → `DEFAULT_POPULAR` (fallback mode).
- The Hero always shows the priority #1 category from the K-Means ranking and takes more than 40% of the usable dashboard width (CA-03). A variant reorders the secondary sections and the Hero's content emphasis; it never moves category #1 out of the Hero.
- Every personalized view shows an AI notice with WCAG AA contrast and a "restore default view" control that switches to `DEFAULT_POPULAR` with global popularity order (CA-05).
- Switching profiles makes no network calls; the reorder finishes in under 1.5 s (CA-02).
- The table lives in a single module. Any change to it updates its tests in the same PR.

## Decision Gates

| Situation | Action |
|---|---|
| A segment value is not in the table | Return `DEFAULT_POPULAR` and add a test for that value |
| A new variant is requested | Add it to the union type, the table, the tests and `references/rule-table.md` |
| A component needs layout logic | Call the domain function; never duplicate the rules in JSX |

## Execution Steps

1. Read `references/rule-table.md`.
2. Write failing Vitest cases for every row of the table, plus the fallback.
3. Implement or modify the domain function until the tests pass.
4. Wire components to the domain output only.
5. Run `npm --prefix web run test` and `npm --prefix web run build`.

## Output Contract

Return the files changed, the table rows covered by tests, and the observed test and build results.

## References

- `references/rule-table.md` — the proposed segment → layout table and section order per variant.
