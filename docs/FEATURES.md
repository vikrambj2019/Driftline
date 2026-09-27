# Driftline features

Driftline is a flight-booking website. This guide describes how the site is
supposed to behave from a traveler's point of view. It is the feature
reference for planning browser checks (for example, the assay regression
baseline).

Start at `/v/clean/`. The bookable calendar runs from October 1, 2026 to
March 31, 2027. Sign in with `demo@example.com` / `demo1234`.

## Search

- Choose round trip or one way.
- "From" and "To" suggest airports as you type a city, airport name, or code;
  a search needs an airport chosen from the suggestions (typing an exact
  three-letter code also works).
- Departure and return dates are picked from a calendar. The return date
  can't be before the departure date.
- Up to 6 adults and up to 2 lap infants (under 2); there can't be more lap
  infants than adults.
- Searching with a missing airport, the same airport twice, or an invalid
  date range shows an error next to the field instead of searching.
- Popular routes on the home page open a ready-made search.

## Results

- Results show 10 flights per page with Previous / Next pages.
- Each flight shows the airline, departure and arrival times (next-day
  arrivals are marked +1), duration, stops, and a "from" price: the lowest
  fare per person, one way, before taxes and fees.
- Filters: include nearby airports (San Francisco Bay Area, New York area),
  nonstop only, airlines, departure time of day, arrive-by time, and a
  maximum price.
- Sort by recommended, price low to high, departure time, or shortest
  duration.
- If no flights match the filters, the page says so and suggests widening them.
- For a round trip, you choose the departing flight first, then the
  returning flight; the chosen departing flight stays visible with a Change
  link.

## Flight details and fares

- The details page lists every segment and layover, and warns when the
  flight arrives the next day.
- Three fares are offered: Basic, Main, and Premium, each with its price per
  person and what's included. Checked-bag fees differ by fare.
- "Fare rules" opens in a new tab.

## Travelers

- Enter each traveler's first and last name (letters, spaces, hyphens, and
  apostrophes only) and date of birth. Adults must be at least 12 on the
  travel date.
- Choose 0–2 checked bags per adult.
- International trips also require a passport number (6–9 letters or digits),
  issuing country, and an expiration date at least 6 months after the last
  travel date. A passport photo page can be attached (optional).
- Lap infants need a name and a date of birth that keeps them under 2 for
  the whole trip.
- Contact email and a phone number with at least 10 digits are required.
- Signed-in users can fill a traveler from their saved travelers.
- Invalid entries show a summary of problems at the top and a message next to
  each field. Valid entries continue to the review page after a short
  availability check.

## Review and book

- The review page shows the flights, travelers, and a price breakdown: base
  fare, taxes and fees, checked bags, and the total.
- Promo code `DRIFT10` takes 10% off the base fare (base fare of at least
  $150). An unknown code shows an error. Promo codes never apply to taxes,
  fees, or bags.
- Booking requires ticking the box confirming the traveler details and fare
  rules. Payment uses demo credits; no card details are ever requested.
- Confirming shows a confirmation page with a booking reference.

## After booking

- The confirmation page offers a downloadable itinerary and receipt.
- My trips (sign-in required) lists every booking with its reference, dates,
  travelers, and total. "View trip" opens the trip's details.
- A trip can be cancelled after confirming in a dialog; its status then shows
  Cancelled.

## Account

- Sign in with email and password. A wrong password shows "Email or password
  is incorrect." After signing in you return to the page you were trying to
  reach, or the Account page.
- The Account page lets you edit first name, last name, mobile phone (at least
  10 digits), and home airport. "Save changes" confirms with "Profile saved",
  and the changes are still there after reloading. The sign-in email can't be
  changed here.
- Saved travelers can be added (name and date of birth), edited, and removed.
  Editing requires a first and last name and a date of birth; the changes are
  still there after reloading.
- The admin console requires a code from an authenticator app.
- Sign out returns you to the search page.

## Other

- A cookie banner offers "Only necessary" and "Accept all"; the choice is
  remembered.
- "Help & fare policies" explains prices, fares, passports, lap infants, and
  promo codes.
- "Reset demo data" in the top bar clears bookings and changes on this device.
