# Demo tasks for coding agents (video 3)

Four small, user-visible features for a coding agent to implement one after
another in this repo. Each prompt is what you type into the agent. AGENTS.md
already tells the agent to write change notes, run `assay check`, fix any
FAIL, rerun the frozen plan, and paste `summary.md` into the PR.

Run them in order on separate branches from `main`. `npm run dev` stays
running on port 5173 throughout.

## 1. Sort by arrival time

> Add "Arrival time: earliest first" to the Sort by menu on the flight
> results page. Next-day arrivals count as later than same-day arrivals.
> Branch: `feature/sort-by-arrival`.

## 2. Recent searches

> On the home page, under the search form, show the traveler's three most
> recent searches (route and dates), newest first. Clicking one reruns that
> search. Keep them per variant in browser storage like the rest of the demo
> data, and don't show the section when there are none.
> Branch: `feature/recent-searches`.

## 3. Maximum trip duration filter

> Add a "Max duration" filter to the results sidebar with options Any, 6h,
> 8h, 10h, and 12h. It hides flights whose total duration exceeds the choice
> and works together with the other filters.
> Branch: `feature/max-duration-filter`.

## 4. Demo-credit balance

> Show the traveler's demo-credit balance on the Account page, starting at
> $5,000.00. Booking a trip deducts its total; cancelling a trip refunds it.
> The review page should show the current balance instead of a fixed amount,
> and booking must be refused with an error if the balance is too low.
> Branch: `feature/demo-credit-balance`.

## Tips for the recording

- Task 4 touches booking, cancellation, and persistence, so it is the most
  likely to fail on the first attempt. Record it last; a visible FAIL, fix,
  and PASS is the point of the video.
- Each task writes its own `results/<feature>/`, so earlier evidence is not
  overwritten.
- If a regression baseline is committed (`assay/plans/baseline/`), ask the
  agent to rerun it after the last task to show nothing else broke.
