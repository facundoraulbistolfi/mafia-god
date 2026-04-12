export interface Rng {
  next(): number;
}

export const mathRandomRng: Rng = {
  next() {
    return Math.random();
  },
};

export class SequenceRng implements Rng {
  private readonly values: number[];

  constructor(values: number[]) {
    this.values = [...values];
  }

  next() {
    const value = this.values.shift();
    if (typeof value === 'number') {
      return clampRandom(value);
    }

    return Math.random();
  }
}

export function clampRandom(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(0.999999, Math.max(0, value));
}
