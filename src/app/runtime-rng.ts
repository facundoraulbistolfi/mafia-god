import { SequenceRng, mathRandomRng } from '../domain/rng';

export function getRuntimeRng() {
  if (
    typeof window !== 'undefined' &&
    Array.isArray(window.__MAFIA_GOD_TEST_RNG_VALUES__) &&
    window.__MAFIA_GOD_TEST_RNG_VALUES__.length > 0
  ) {
    return new SequenceRng(window.__MAFIA_GOD_TEST_RNG_VALUES__);
  }

  return mathRandomRng;
}
