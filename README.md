# Driftline — a synthetic travel site for browser-agent demos

Driftline is a fictional flight-booking website for demonstrating and evaluating
browser agents:

- **[assay](https://github.com/vikrambj2019/assay)**, the pre-PR browser testing agent, which should find the planted defects.
- **browser-agent**, the workflow agent, which should complete tasks through realistic
  obstacles without claiming false success.

Every flight, fare, and booking is generated. Airport codes are real; airlines are
fictional. There is no backend and no payment form. Checkout uses "demo credits."

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
# or a production build
npm run build && npm run preview   # http://localhost:4173
```

Open `/` for the variant index, or go straight to a variant, e.g.
`http://localhost:5173/v/clean/`.

Demo sign-in: `demo@example.com` / `demo1234` (public, works only here).

## Variants

Each variant is served under `/v/<id>/`. IDs are deliberately opaque: nothing on
a page describes what a variant changes, so an agent has to discover behavior
rather than read it. Answer keys belong in each consuming project's own
evaluation harness, outside the agent's context.

| ID | Purpose |
|---|---|
| `clean` | Reference site. No planted defects. |
| `b1` – `b6` | Defect variants for the testing agent. |
| `w1` – `w2` | Obstacle and interruption variants for the workflow agent. |

## What the site exercises

- Airport autocomplete (ARIA combobox) and a custom calendar date picker
- Search results with filters, sort, pagination, next-day arrivals, and a
  "nearby airports" option
- Fare selection (Basic / Main / Premium) with bag fees, and fare rules that open in a new tab
- Multi-step booking: outbound → return → travelers → review → confirmation
- Conditional form sections: passport fields for international trips, lap infants
- Validation errors with an error summary, a deliberate ~1 s loading overlay
- Taxes and fees that appear only at review, plus a promo code (`DRIFT10`)
- Sign-in, account profile, saved travelers, My trips, trip detail, trip cancellation
- Text-file downloads (itinerary, receipt) and an optional file upload
- An admin console permanently gated behind two-step verification
- A cookie banner

## State and isolation

State lives in the browser's `localStorage`, namespaced per variant. A fresh
browser context (which is what Playwright gives each run) always starts from the
same seed data, so concurrent visitors never see each other's bookings, and there
is nothing to reset on a server. **Reset demo data** in the top bar clears it for
humans.

Flights are deterministic: the same route and date always produce the same
flights, times, and fares, so demo recordings are reproducible and questions like
"the cheapest nonstop arriving before 6 PM" have one correct answer. The bookable
calendar is fixed to October 1, 2026 – March 31, 2027 regardless of today's date.

Creating bookings and editing profiles is harmless here, so running a testing
agent with mutations enabled (`ASSAY_ALLOW_MUTATIONS=true`) is fine **on this site
only**.

## Ground-truth checks

`tests/ground_truth.py` drives the site with Playwright and confirms the clean
flow works and each variant's behavior is observable. This is a maintainer test;
agents under evaluation never see it.

```bash
pip install playwright && playwright install chromium
npm run build && npm run preview &
python tests/ground_truth.py --base http://localhost:4173 --shots shots/
```

## Hosting (free)

It's a static single-page app, so any static host works and there are no cold starts.

- **Render**: connect the repo and Render picks up `render.yaml` (static site,
  SPA rewrite, `noindex` header).
- **Netlify / Cloudflare Pages**: build command `npm run build`, output `dist`.
  `public/_redirects` handles SPA routing.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
