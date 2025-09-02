export class AgeRange {
  readonly #min: number;
  readonly #max: number;

  private constructor(min: number, max: number) {
    this.#min = min;
    this.#max = max;
    Object.freeze(this);
  }

  static create(min: number, max: number): AgeRange {
    if (min < 0) {
      throw new Error('Minimum age must be 0 or greater');
    }
    if (max < 0) {
      throw new Error('Maximum age must be 0 or greater');
    }
    if (max < min) {
      throw new Error('Maximum age must be greater than or equal to minimum age');
    }
    if (max > 120) {
      throw new Error('Maximum age must be 120 or less');
    }

    return new AgeRange(min, max);
  }

  static reconstruct(min: number, max: number): AgeRange {
    return new AgeRange(min, max);
  }

  get min(): number {
    return this.#min;
  }

  get max(): number {
    return this.#max;
  }

  includes(age: number): boolean {
    return age >= this.#min && age <= this.#max;
  }

  equals(other: AgeRange): boolean {
    return this.#min === other.#min && this.#max === other.#max;
  }

  toString(): string {
    return `${this.#min}-${this.#max}歳`;
  }

  toJSON(): any {
    return {
      min: this.#min,
      max: this.#max,
    };
  }
}
