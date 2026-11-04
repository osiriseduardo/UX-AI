# Segment → layout rule table

> **Status: PROPOSED.** The team has not confirmed this mapping. Confirm or edit it before implementing, and keep this file and the tests in sync.

Inputs come from the exported profile artifact. `activity_status` and `behavior_segment` are fixed thresholds over recency and purchase count (see `uxai-ml-pipeline/references/dataset-findings.md`). They are business segments, not model outputs.

## Rules (first match wins)

| # | Condition | Variant |
|---|---|---|
| 1 | Profile data missing, null or unknown | `DEFAULT_POPULAR` |
| 2 | `activity_status` is `At Risk`, `Dormant` or `Inactive` | `OFERTAS_PRIMERO` |
| 3 | `behavior_segment` is `Frequent Buyer` or `Regular Buyer` | `RECOMPRA_PRIMERO` |
| 4 | `behavior_segment` is `New Buyer` or `Occasional Buyer` | `EXPLORACION` |
| 5 | Anything else | `DEFAULT_POPULAR` |

The user's "restore default view" choice overrides every rule with `DEFAULT_POPULAR`.

## Section order per variant

The Hero is always the priority #1 category (CA-03). The variant decides what the Hero emphasizes and the order of the secondary blocks.

| Variant | Hero emphasis | Secondary order |
|---|---|---|
| `OFERTAS_PRIMERO` | Discounted products in category #1 | Offers · Suggestions · Keep shopping |
| `RECOMPRA_PRIMERO` | Previously bought items in category #1 | Keep shopping · Suggestions · Offers |
| `EXPLORACION` | Best sellers in category #1 | Suggestions · Offers · Keep shopping |
| `DEFAULT_POPULAR` | Global best sellers (no personalization) | Categories by global popularity |

Categories #2–#4 from the ranking fill the secondary category blocks in rank order.
