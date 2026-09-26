import { FARES, isInternational } from './data.js';

export const PROMO_CODES = {
  DRIFT10: { label: '10% off base fare', percent: 10, minBase: 150 },
};

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Price a trip. `legs` is [{ flight, fare }] (one or two legs).
 * `bags` is an array of checked-bag counts, one per adult.
 * Returns every line item plus the total.
 *
 * `ignorePromoInTotal` exists only so a defect variant can show the promo line
 * while leaving the total unchanged.
 */
export function priceTrip({ legs, adults, infants, bags = [], promo, ignorePromoInTotal = false }) {
  const intl = legs.some((l) => isInternational(l.flight.from, l.flight.to));
  const adultFare = legs.reduce((s, l) => s + l.flight.fares[l.fare], 0);
  const baseAdults = adultFare * adults;
  const baseInfants = intl ? r2(adultFare * 0.1) * infants : 0;
  const base = r2(baseAdults + baseInfants);

  const segments = legs.reduce((s, l) => s + l.flight.segments.length, 0);
  const taxPct = r2(base * 0.075);
  const segmentFees = r2(5.6 * segments * adults);
  const intlFees = intl ? r2(98.4 * adults) : 0;
  const taxes = r2(taxPct + segmentFees + intlFees);

  let bagFees = 0;
  legs.forEach((l) => {
    const [first, second] = FARES[l.fare].bagFee;
    bags.forEach((count) => {
      if (count >= 1) bagFees += first;
      if (count >= 2) bagFees += second;
    });
  });
  bagFees = r2(bagFees);

  let discount = 0;
  let promoError = null;
  const code = (promo || '').trim().toUpperCase();
  if (code) {
    const p = PROMO_CODES[code];
    if (!p) promoError = "This promo code isn't valid.";
    else if (base < p.minBase) promoError = `This code needs a base fare of at least $${p.minBase}.`;
    else discount = r2((base * p.percent) / 100);
  }

  const total = r2(base + taxes + bagFees - (ignorePromoInTotal ? 0 : discount));

  return {
    intl,
    adultFare,
    base,
    baseInfants,
    taxes,
    taxBreakdown: { taxPct, segmentFees, intlFees },
    bagFees,
    promoCode: discount ? code : null,
    promoError,
    discount,
    total,
  };
}
