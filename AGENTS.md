# Driftline — agent instructions

Driftline is a synthetic flight-booking site (React + Vite, no backend) used to
demo and evaluate browser agents. State lives in browser `localStorage`; flight
data is generated deterministically in `src/lib/data.js`.

## Commands

```bash
npm install
npm run dev                  # http://localhost:5173 (use /v/clean/)
npm run build && npm run preview   # production build on http://localhost:4173
python tests/ground_truth.py --base http://localhost:4173   # maintainer checks
```

## Project rules

- Build new features into the shared code so the `clean` variant gets them.
  Do **not** remove, fix, or reveal the planted behavior of variants `b1`–`b6`
  and `w1`–`w2` (search `v.is(` to find it). Nothing on a page may describe
  what a variant changes.
- Keep data deterministic: no `Math.random()`, `Date.now()`, or today's date
  in anything a user sees. The bookable window is fixed in `src/lib/format.js`.
- Keep pages accessible: every input has a label, buttons have names, and
  errors use `role="alert"`. Browser agents rely on these.
- No real payment fields, no external requests besides the existing web font.
- After a change, `npm run build` must succeed and `tests/ground_truth.py` must
  still pass against the preview build.

## Browser checks (assay)

After changing user-visible behavior, verify it in a real browser with
[assay](https://github.com/vikrambj2019/assay) before opening a pull request.

**Setup (already done by a human):** `npm run dev` is running;
`.env` points `ASSAY_BASE_URL` at `http://localhost:5173/v/clean` with the demo
account and `ASSAY_ALLOW_MUTATIONS=true` (safe here: synthetic, per-browser
state). `ANTHROPIC_API_KEY` is set. Do not ask for other credentials.

**1. Describe the change** in `changes/<feature>.md` as observable outcomes
(what a user sees), one per bullet.

**2. Run the check** (stdout is one JSON summary; logs go to stderr):

```bash
assay check --notes changes/<feature>.md --diff main --depth low --format json --output results/<feature>
```

**3. Act on the summary:**

- `exit_code` 0 / `status` `pass`: done at this depth.
- `exit_code` 1 / `status` `fail`: the app is wrong. Use
  `failures[].assertions[]` (`expected` vs `observed`) to fix the code, then
  rerun the same plan with the command in `rerun.failed`:
  `assay check --plan results/<feature>/plan.json --only SCENARIO_ID --format json --output results/<feature>`
- `exit_code` 2 / `status` `incomplete`: read `needs_attention`. ERROR is a
  harness problem, BLOCKED is a prerequisite or policy, UNVERIFIED is
  ambiguous. Do not change application code for these; tell the user.
- `exit_code` 2 / `status` `invalid_input` or `planning_failed`: fix the
  command or configuration as described in `error`.

**4. Before the PR:**

- Rerun the full feature plan without `--only`:
  `assay check --plan results/<feature>/plan.json --format json --output results/<feature>`
- Run the regression baseline, if one is committed:
  `assay check --plan assay/plans/baseline/plan.json --format json --output results/baseline`
- Paste `results/<feature>/summary.md` into the PR description.

**Rules:** at most two fix-and-rerun cycles, then stop and report. Never edit
a `plan.json`, weaken the notes, or regenerate the plan after a FAIL. Never
report UNVERIFIED, BLOCKED, SKIPPED, or a partial (`--only`) run as a pass.
Use `--depth low` while iterating and `medium` before the PR.
