# Regression baseline

`baseline/plan.json` is a frozen assay plan generated once from
`docs/FEATURES.md`, the product feature guide.
Rerunning it after any change checks that existing features still work, with
the same expectations every time.

Create or refresh it (review the table it prints before committing):

```bash
npm run dev &
assay check --notes docs/FEATURES.md --readme docs/FEATURES.md \
  --depth high --plan-only --output assay/plans/baseline
git add assay/plans/baseline/plan.json
```

Run it:

```bash
assay check --plan assay/plans/baseline/plan.json --output results/baseline
```

Only regenerate the baseline when features were intentionally added or
changed, never to make a failing run pass.

Why `docs/FEATURES.md` and not `README.md`: the README is about the demo
site itself (variants, hosting, maintainer tests). Planning from it would
produce scenarios about switching variants instead of testing features.
