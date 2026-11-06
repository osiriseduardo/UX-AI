---
name: uxai-acceptance-tests
description: "Trigger: UX-AI tests, acceptance criteria, CA-01..CA-05, QA, traceability matrix, E5 report. Map each criterion to an automated test."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.1"
---

## Activation Contract

Load before writing, running or reporting tests tied to the acceptance criteria.

## Hard Rules

- Each criterion has at least one test whose name starts with its ID (`test_ca01_silhouette`, `CA-03 hero holds priority #1`).
- Test through public interfaces only: domain functions, artifacts, the rendered page.
- Assert every effect the criterion names (value, element, timing, contrast).
- Never weaken a threshold, skip a test or mark it expected-to-fail. Report the measured value.
- Keep scratch files outside the repo or in git-ignored paths.
- After changing a CA test, update the traceability row in `docs/acceptance-criteria.md`.

## Decision Gates

| Criterion | Test |
|---|---|
| CA-01' clustering | pytest, `ml/tests/test_ca01_clustering.py` |
| CA-02 reorder < 1.5 s | Playwright, `web/e2e/ca02-reorder-time.spec.ts` |
| CA-03 Hero = #1, > 40% width | Vitest on the domain function + Playwright box size (desktop and mobile) |
| CA-04 round-trip navigation | Playwright in the web app, `web/e2e/ca04-navigation.spec.ts` |
| CA-05 AI notice + restore | Playwright + `@axe-core/playwright` |

## Execution Steps

1. Read `docs/acceptance-criteria.md` for the exact wording.
2. Write the test so it fails first.
3. Run `uv run --project ml pytest`, `pnpm --dir web test`, or Playwright.
4. Update the traceability matrix.

## Output Contract

One line per criterion: ID, test path, command, observed result with the measured value.
