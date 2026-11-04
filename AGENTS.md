# AGENTS.md — UX-AI

Rules for AI coding agents (OpenCode, Claude Code) working in this repository. Always loaded; keep it short.

## Project

Prototype for the course "Formulación de Proyectos de Tecnología" (UT BIS Cancún). A K-Means model decides **which** product categories each user sees (priority 1–4); a deterministic rule engine decides **how** the layout presents them. Final demo: **2026-12-10** (immovable).

## Architecture

- Offline Python pipeline → small JSON artifacts → static web front end. No backend server.
- K-Means is the only ML model. The layout engine is a rule table, not ML.
- `contracts/artifacts.schema.json` is the contract between `ml/` and `web/`. Changing it requires updating both sides in the same PR.

## Layout (planned; create directories as their PRs land)

| Path | Contents |
|---|---|
| `scripts/` | `setup.sh` (macOS/Linux) and `setup.ps1` (Windows) toolchain setup |
| `contracts/` | JSON schema shared by `ml/` and `web/` |
| `ml/` | Python 3.12 + uv: `src/uxai/` modules, `tests/`, `notebooks/` (EDA only), `data/raw/` (git-ignored) |
| `web/` | Vite + React + TypeScript; `src/domain/` is pure TS (no React, no I/O) |
| `docs/` | Acceptance criteria, traceability matrix, change requests |

## Commands

- Setup: `scripts/setup.sh` or `powershell -ExecutionPolicy Bypass -File scripts\setup.ps1` (`--check` / `-Check` only reports).
- ML: `uv run --project ml pytest`, `uv run --project ml ruff check ml`.
- Web: `npm --prefix web run dev | test | build | lint`.
- Do not add a Makefile: it does not run on Windows.

## Git workflow

- Branch from `develop`; open the PR against `develop`. Never push to `main`; only the repository owner merges `develop` → `main` at milestones.
- Conventional Commits (`feat(ml): …`, `test(web): …`). Keep PRs around 400 changed lines.
- Never commit: the raw dataset CSV, `*.joblib` models, `.env` or API keys, `node_modules/`, `.venv/`, notebook outputs.

## Conventions

- Code, comments, tests, commit messages and docs in English. The team talks in Spanish.
- Every acceptance criterion (CA-01..CA-05) maps to an automated test.
- Reuse existing domain functions; do not re-implement ranking or rule logic in components.

## Project skills (`.claude/skills/`)

| Skill | Load when |
|---|---|
| `uxai-ml-pipeline` | Dataset, preprocessing, K-Means, clustering metrics, exporting artifacts (`ml/`) |
| `uxai-layout-rules` | Layout variants, Hero, rule table, restore-default view, AI notice (`web/src/domain`, `web/src/components`) |
| `uxai-acceptance-tests` | Writing or running tests for CA-01..CA-05, traceability matrix, QA reports |
