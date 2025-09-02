export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  Unknown = 'unknown',
}

export class GenderSet {
  readonly #genders: Set<Gender>;

  private constructor(genders: Gender[]) {
    this.#genders = new Set(genders);
    Object.freeze(this);
  }

  static create(genders: Gender[]): GenderSet {
    if (!genders || genders.length === 0) {
      throw new Error('At least one gender must be specified');
    }

    return new GenderSet(genders);
  }

  static createAll(): GenderSet {
    return new GenderSet(Object.values(Gender));
  }

  static reconstruct(genders: Gender[]): GenderSet {
    return new GenderSet(genders);
  }

  includes(gender: Gender): boolean {
    return this.#genders.has(gender);
  }

  get genders(): Gender[] {
    return Array.from(this.#genders);
  }

  get size(): number {
    return this.#genders.size;
  }

  equals(other: GenderSet): boolean {
    if (this.#genders.size !== other.#genders.size) {
      return false;
    }
    
    for (const gender of this.#genders) {
      if (!other.#genders.has(gender)) {
        return false;
      }
    }
    
    return true;
  }

  toString(): string {
    const genderNames = this.genders.map(gender => {
      switch (gender) {
        case Gender.Male: return '男性';
        case Gender.Female: return '女性';
        case Gender.Other: return 'その他';
        case Gender.Unknown: return '不明';
        default: return gender;
      }
    });
    
    return genderNames.join('、');
  }

  toJSON(): any {
    return {
      genders: this.genders,
    };
  }
}