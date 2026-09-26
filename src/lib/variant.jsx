import { createContext, useContext } from 'react';

/*
 * Variant IDs are deliberately opaque. Nothing rendered on a page may describe
 * what a variant changes: the agent under test must discover behavior, not read
 * it. Answer keys live in each consuming product's own repository.
 *
 *   clean      reference site, no planted defects
 *   b1 … b6    defect variants (used by bta, the testing agent)
 *   w1 … w2    obstacle / interruption variants (used by browser-agent)
 */
export const VARIANTS = ['clean', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'w1', 'w2'];

export const VariantContext = createContext({ id: 'clean', base: '/v/clean' });

export function useVariant() {
  const ctx = useContext(VariantContext);
  return {
    ...ctx,
    is: (id) => ctx.id === id,
    to: (path = '/') => `${ctx.base}${path.startsWith('/') ? path : `/${path}`}`,
  };
}
