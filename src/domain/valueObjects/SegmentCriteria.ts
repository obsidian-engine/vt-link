import { AgeRange } from './AgeRange';
import { type Gender, GenderSet } from './Gender';
import { type RegionCode, RegionSet } from './Region';

export class SegmentCriteria {
  readonly #genders: GenderSet | null;
  readonly #ageRange: AgeRange | null;
  readonly #regions: RegionSet | null;

  private constructor(
    genders: GenderSet | null,
    ageRange: AgeRange | null,
    regions: RegionSet | null
  ) {
    this.#genders = genders;
    this.#ageRange = ageRange;
    this.#regions = regions;
    Object.freeze(this);
  }

  static create(params: {
    genders?: Gender[];
    ageRange?: { min: number; max: number };
    regions?: RegionCode[];
  }): SegmentCriteria {
    const genders = params.genders ? GenderSet.create(params.genders) : null;
    const ageRange = params.ageRange
      ? AgeRange.create(params.ageRange.min, params.ageRange.max)
      : null;
    const regions = params.regions ? RegionSet.create(params.regions) : null;

    if (!genders && !ageRange && !regions) {
      throw new Error('At least one criterion must be specified');
    }

    return new SegmentCriteria(genders, ageRange, regions);
  }

  static createAll(): SegmentCriteria {
    return new SegmentCriteria(
      GenderSet.createAll(),
      AgeRange.create(0, 120),
      RegionSet.createAll()
    );
  }

  static reconstruct(data: {
    genders?: Gender[];
    ageRange?: { min: number; max: number };
    regions?: RegionCode[];
  }): SegmentCriteria {
    const genders = data.genders ? GenderSet.reconstruct(data.genders) : null;
    const ageRange = data.ageRange
      ? AgeRange.reconstruct(data.ageRange.min, data.ageRange.max)
      : null;
    const regions = data.regions ? RegionSet.reconstruct(data.regions) : null;

    return new SegmentCriteria(genders, ageRange, regions);
  }

  get genders(): GenderSet | null {
    return this.#genders;
  }

  get ageRange(): AgeRange | null {
    return this.#ageRange;
  }

  get regions(): RegionSet | null {
    return this.#regions;
  }

  matches(user: { gender: Gender; age: number; region: RegionCode }): boolean {
    if (this.#genders && !this.#genders.includes(user.gender)) {
      return false;
    }

    if (this.#ageRange && !this.#ageRange.includes(user.age)) {
      return false;
    }

    if (this.#regions && !this.#regions.includes(user.region)) {
      return false;
    }

    return true;
  }

  isEmpty(): boolean {
    return !this.#genders && !this.#ageRange && !this.#regions;
  }

  equals(other: SegmentCriteria): boolean {
    const gendersEqual = this.#genders
      ? other.#genders
        ? this.#genders.equals(other.#genders)
        : false
      : !other.#genders;

    const ageRangeEqual = this.#ageRange
      ? other.#ageRange
        ? this.#ageRange.equals(other.#ageRange)
        : false
      : !other.#ageRange;

    const regionsEqual = this.#regions
      ? other.#regions
        ? this.#regions.equals(other.#regions)
        : false
      : !other.#regions;

    return gendersEqual && ageRangeEqual && regionsEqual;
  }

  toString(): string {
    const parts: string[] = [];

    if (this.#genders) {
      parts.push(`性別: ${this.#genders.toString()}`);
    }

    if (this.#ageRange) {
      parts.push(`年齢: ${this.#ageRange.toString()}`);
    }

    if (this.#regions) {
      parts.push(`地域: ${this.#regions.toString()}`);
    }

    return parts.join(', ');
  }

  toJSON(): any {
    return {
      genders: this.#genders?.toJSON().genders || null,
      ageRange: this.#ageRange?.toJSON() || null,
      regions: this.#regions?.toJSON().regions || null,
    };
  }
}
