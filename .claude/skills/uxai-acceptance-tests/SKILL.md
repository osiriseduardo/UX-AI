---
name: uxai-acceptance-tests
description: "Trigger: UX-AI tests, acceptance criteria, CA-01..CA-05, QA, traceability matrix, E5 report. Map each criterion to an automated test."
license: UNLICENSED
compatibility: opencode
metadata:
  author: "osiriseduardo"
  version: "1.0"
---

## Activation Contract

Load before writing, running or reporting tests tied to the acceptance criteria, or before updating the traceability matrix or the QA report (deliverable E5).

## Hard Rules

- Every acceptance criterion has at least one automated test whose name starts with its ID (for example `test_ca01_silhouette`, `CA-03 hero holds priority #1`).
- Test through public interfaces: domain functions, exported artifacts, the rendered page. Never test private helpers or implementation details.
- Assert every observable effect a criterion names (value, element, timing, contrast), not just that the code runs.
- Never weaken a threshold, skip a test or mark it expected-to-fail to make a criterion pass. Report the failure with the measured value.
- Keep test scratch files and caches outside the repo or in git-ignored paths.
- After adding or changing a CA test, update the traceability matrix row (requirement → criterion → test path → status).

## Decision Gates

| Criterion | Test type and location |
|---|---|
| CA-01' clustering quality | pytest, `ml/tests/test_ca01_clustering.py` |
| CA-02 reorder < 1.5 s | Playwright, `web/e2e/ca02-reorder-time.spec.ts` |
| CA-03 Hero = priority #1, > 40% width | Vitest on the domain function plus Playwright measuring the Hero box |
| CA-04 round-trip navigation, no broken links | Playwright, `web/e2e/ca04-navigation.spec.ts` |
| CA-05 AI notice (WCAG AA) and restore control | Playwright with `@axe-core/playwright` |

## Execution Steps

1. Read `references/acceptance-criteria.md` for the exact wording.
2. Write the test so it fails first against missing behavior.
3. Run it: `uv run --project ml pytest` for ML, `npm --prefix web run test` for Vitest, Playwright for e2e.
4. Update the traceability matrix with the test path and the observed status.

## Output Contract

Return one line per criterion touched: ID, test path, command, observed result (pass/fail with the measured value).

## References

- `references/acceptance-criteria.md` — the approved criteria and the CA-01 modification.
