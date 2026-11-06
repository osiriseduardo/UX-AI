# AGENTS.md — UX-AI

Always loaded. Keep it short; details live in `docs/` and load on demand.

**Project:** demo store whose home page adapts per customer. K-Means picks **which** categories (priority 1–4); a rule table decides **how** the Home is arranged. Demo: 2026-12-10.

**Source of truth:** `docs/architecture.md`. Read it before changing structure. Never copy its content into other files; link to it.

## Rules

- K-Means is the only ML. Never add another model.
- `contracts/artifacts.schema.json` binds `ml/` and `web/`. Change both in the same PR.
- Branch from `develop`, PR to `develop`. Never push to `main`.
- Conventional Commits. About 400 changed lines per PR.
- Never commit the dataset CSV, `*.joblib`, `.env`, `node_modules/`, `.venv/` or `.atl/`.
- Code, comments, tests and docs in English.

## Commands

- Setup: `scripts/setup.sh` (macOS/Linux) or `powershell -ExecutionPolicy Bypass -File scripts\setup.ps1`
- ML: `uv run --project ml pytest`
- Web: `npm --prefix web run dev|test|build|lint`

## Skills (load the one that matches the task)

| Skill | Task |
|---|---|
| `uxai-ml-pipeline` | dataset, K-Means, metrics, export (`ml/`) |
| `uxai-layout-rules` | rule engine, Hero, AI notice, responsive Home (`web/`) |
| `uxai-acceptance-tests` | CA-01'..CA-05 tests, traceability |
