# UX-AI

Prototype of an online store whose home page adapts to each customer. Built for the course "Formulación de Proyectos de Tecnología" (UT BIS Cancún). Final demo: **2026-12-10**.

## What it does

When you pick a customer profile, the store rearranges itself for that customer:

1. **Which categories?** A K-Means model groups 50,000 customers by the categories they prefer. Each group gets its own top-4 categories. The #1 category always goes in the large Hero banner.
2. **How are they arranged?** A simple rule table looks at the customer's activity and decides what the Hero highlights and the order of the sections below it. For example, a customer who has not bought in a while sees offers first.
3. **Transparency.** Every personalized view says that it was arranged automatically and offers a button to restore the default view.

K-Means is the only machine learning in the project. The layout is plain rules. Products are mock data. The site works on desktop and mobile.

```
dataset (CSV) ──► ml/ (Python, offline) ──► JSON files ──► web/ (React, static site)
                  trains K-Means                          applies the rules and shows the store
```

The full design, the components and the decisions are in **[docs/architecture.md](docs/architecture.md)**, the single source of truth.

## Repository structure

| Path | Contents | Status |
|---|---|---|
| `scripts/` | Toolchain setup for macOS, Linux and Windows | ready |
| `docs/` | Architecture, layout rules, acceptance criteria, dataset findings | ready |
| `.claude/skills/`, `AGENTS.md` | Instructions for AI coding agents (OpenCode) | ready |
| `contracts/` | JSON schema shared by `ml/` and `web/` | planned |
| `ml/` | Python pipeline: data loading, K-Means, metrics, export | planned |
| `web/` | Vite + React + TypeScript store | planned |

## Getting started

### 1. Install the tools

Run the setup script from the repository root. It checks git, uv, Python and Node.js, installs anything missing or outdated, and installs the project dependencies once `ml/` and `web/` exist.

**macOS / Linux** (Homebrew on macOS; apt, dnf, yum, pacman or zypper on Linux):

```sh
scripts/setup.sh          # check and install (asks before installing)
scripts/setup.sh --check  # only report; exits 1 if something is missing
scripts/setup.sh --yes    # install without asking
```

**Windows** (PowerShell, uses winget):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1          # check and install
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -Check   # only report
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -Yes     # install without asking
```

Minimum versions are defined in [`scripts/tool-versions.txt`](scripts/tool-versions.txt). Python is installed through uv, and Node.js through fnm (macOS/Linux) or winget (Windows). After the first install, open a new terminal so the PATH changes take effect.

### 2. Get the dataset (only for ML work)

The dataset is not committed. Ask the team for `E-commerce_Customer_Segmentation_2026.csv` and place it in `ml/data/raw/`. The web app does not need it: it reads the small JSON files already committed in `web/public/data/`.

### 3. Run the project

These commands work once `ml/` and `web/` are added:

| Task | Command |
|---|---|
| Run the ML tests | `uv run --project ml pytest` |
| Lint the Python code | `uv run --project ml ruff check ml` |
| Start the store locally | `npm --prefix web run dev` |
| Run the web unit tests | `npm --prefix web run test` |
| Build the static site | `npm --prefix web run build` |
| Lint the web code | `npm --prefix web run lint` |

## How we work

- `develop` is the working branch. Create your branch from it (`feat/…`, `fix/…`, `docs/…`) and open the pull request against `develop`.
- Never push to `main`. The repository owner merges `develop` into `main` at milestones.
- Pull requests need one approval. Keep them around 400 changed lines.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(web): add hero component`.
- Code, comments, tests and docs are written in English.
- Never commit the dataset, trained models (`*.joblib`), `.env` files, `node_modules/` or `.venv/`.
- Each acceptance criterion (CA-01'..CA-05) has an automated test. See [docs/acceptance-criteria.md](docs/acceptance-criteria.md).

## Working with OpenCode

The repository is set up for [OpenCode](https://opencode.ai), and it also works with the free models:

- `AGENTS.md` is loaded in every session. It is kept short on purpose.
- Three skills in `.claude/skills/` load only when the task needs them:
  - `uxai-ml-pipeline` for the model.
  - `uxai-layout-rules` for the home page rules.
  - `uxai-acceptance-tests` for tests.
- The skills point to `docs/` instead of copying it, so they always read the current version.

Tips to keep the context small with free models:

1. Start a new session for each task.
2. Name the skill in your prompt, for example: "Use the uxai-layout-rules skill and add the fallback rule."
3. Name the exact files the task touches instead of asking the agent to explore the whole repository.
4. Review the diff and run the tests before you commit.

## Documentation

- [Architecture](docs/architecture.md)
- [Layout rules](docs/layout-rules.md)
- [Acceptance criteria and traceability](docs/acceptance-criteria.md)
- [Dataset findings](docs/dataset-findings.md)

## Team

| Member | Role |
|---|---|
| Juan Antonio | Project lead, Figma design |
| Osiris | Data preprocessing, front end and AI integration |
| Erik | K-Means model, QA |
| Cristian | Documentation, change control |
