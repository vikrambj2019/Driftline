import { useCallback, useSyncExternalStore } from 'react';

/*
 * Per-browser, per-variant state kept in localStorage.
 *
 * A fresh Playwright browser context starts with empty storage, so every agent
 * run gets its own isolated, freshly seeded copy of the site. Concurrent runs
 * by different visitors never see each other's data, and there is no server
 * state to reset.
 */
const PREFIX = 'driftline:v1:';
const listeners = new Set();
const cache = {};

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'demo1234';

function seed() {
  return {
    session: null,
    profile: {
      firstName: 'Dana',
      lastName: 'Rivera',
      email: DEMO_EMAIL,
      phone: '(555) 010-2233',
      homeAirport: 'SFO',
    },
    savedTravelers: [
      { id: 'st-1', firstName: 'Dana', lastName: 'Rivera', dob: '1988-04-17' },
      { id: 'st-2', firstName: 'Sam', lastName: 'Rivera', dob: '1990-09-03' },
    ],
    trips: [],
    draft: null,
    seq: 0,
  };
}

function read(variant) {
  if (!(variant in cache)) {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(PREFIX + variant) || '{}');
    } catch {
      stored = {};
    }
    cache[variant] = { ...seed(), ...stored };
  }
  return cache[variant];
}

function write(variant, next) {
  cache[variant] = next;
  try {
    localStorage.setItem(PREFIX + variant, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in-memory copy */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(variant) {
  const state = useSyncExternalStore(subscribe, () => read(variant));
  const update = useCallback(
    (patch) => {
      const current = read(variant);
      write(variant, typeof patch === 'function' ? patch(current) : { ...current, ...patch });
    },
    [variant],
  );
  return [state, update];
}

export function resetAllDemoData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('driftline:'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  Object.keys(cache).forEach((k) => delete cache[k]);
  listeners.forEach((l) => l());
}

export function getFlag(name) {
  try {
    return localStorage.getItem(`driftline:flag:${name}`);
  } catch {
    return null;
  }
}

export function setFlag(name, value) {
  try {
    localStorage.setItem(`driftline:flag:${name}`, value);
  } catch {
    /* ignore */
  }
}
