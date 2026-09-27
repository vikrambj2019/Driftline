# Recording the demo videos

Three short videos that tell one story: explore a site, verify one change,
then scale verification across a coding agent's tasks. Everything shown is
real output; nothing is staged except which branch is checked out.

## Before any recording

1. Install assay (branch `assay-agent-interface` until it is merged):
   `pip install -e ~/Projects/assay` and `playwright install chromium`.
2. In this repo: `cp .env.example .env`, add `ANTHROPIC_API_KEY`, then set
   `ASSAY_HEADLESS=false`, `ASSAY_SLOWMO_MS=400`, and `ASSAY_RECORD_VIDEO=true`
   so the browser is visible and every scenario also saves its own video.
3. `npm install && npm run dev` (leave it running).
4. Screen: 1920×1080, browser zoom about 125%, terminal font about 18pt,
   terminal on the left third, browser on the right.
5. Do one full practice run of each video. Model runs vary a little; keep the
   best take.

## Video 1 — Cold start (about 90 seconds)

"Point it at a site, get a test plan, choose what to run."

1. Show the site briefly: `http://localhost:5173/v/clean/`.
2. In Claude Code (in this repo), type:
   > Plan a full browser test of this site from docs/FEATURES.md. Show me the
   > plan and ask me what to run.
3. The agent runs
   `assay check --notes docs/FEATURES.md --readme docs/FEATURES.md --depth high --plan-only --format json --output assay/plans/baseline`
   and shows the scenario table, then asks.
4. Answer: "Run the sign-in, profile, and booking scenarios." The agent runs
   `assay check --plan assay/plans/baseline/plan.json --only … --output results/baseline`.
5. Show the browser working (speed up 2–3× in the edit), then `report.html`.
6. End on: "Saved as a baseline. Every future change reruns it."
   Commit `assay/plans/baseline/plan.json` afterwards.

## Video 2 — One change, verified (about 75 seconds)

Uses the prepared branches for "Edit saved traveler": the first attempt
forgets to validate an empty last name; the fix adds it.

1. `git checkout demo/edit-saved-traveler-attempt-1`. Show the feature working
   in the browser (edit a saved traveler, reload, the name stuck).
2. Show `changes/edit-saved-traveler.md`.
3. Run:
   `assay check --notes changes/edit-saved-traveler.md --diff main --depth low --output results/edit`
4. Result: FAIL on the empty-last-name scenario, with expected vs observed.
   Open `report.html` and play that scenario's recording.
5. `git checkout demo/edit-saved-traveler` (the fix). Rerun the frozen plan:
   `assay check --plan results/edit/plan.json --output results/edit`
6. Result: PASS. Optionally rerun the baseline to show nothing else broke.
7. Show `results/edit/summary.md`: "this is what goes in the PR."

## Video 3 — Coding agent, four tasks (about 2 minutes)

1. Show `AGENTS.md` / `CLAUDE.md` for five seconds: "one rule: verify every
   feature with assay."
2. Give the agent the four prompts in `docs/DEMO_TASKS.md`, one at a time.
3. Montage at 3–4× speed: notes written, `assay check --format json`, result,
   PR description with `summary.md`. Slow down to real time for the task
   that fails first, its fix, and the frozen rerun turning green.
4. End on four PRs, each with its verification summary.

## Editing

- Caption everything; most viewers watch muted.
- Zoom in on the one line that matters: the reload, the FAIL, the observed
  value, the PASS.
- Cut every spinner. The per-scenario `video.webm` files are good B-roll.
- Final card: "assay — browser checks with evidence-backed verdicts" and the
  repository URL.
