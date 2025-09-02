export enum RegionCode {
  Hokkaido = 'hokkaido',
  Tohoku = 'tohoku',
  Kanto = 'kanto',
  Chubu = 'chubu',
  Kansai = 'kansai',
  Chugoku = 'chugoku',
  Shikoku = 'shikoku',
  Kyushu = 'kyushu',
  Okinawa = 'okinawa',
  Unknown = 'unknown',
}

export class RegionSet {
  readonly #regions: Set<RegionCode>;

  private constructor(regions: RegionCode[]) {
    this.#regions = new Set(regions);
    Object.freeze(this);
  }

  static create(regions: RegionCode[]): RegionSet {
    if (!regions || regions.length === 0) {
      throw new Error('At least one region must be specified');
    }

    return new RegionSet(regions);
  }

  static createAll(): RegionSet {
    return new RegionSet(Object.values(RegionCode));
  }

  static reconstruct(regions: RegionCode[]): RegionSet {
    return new RegionSet(regions);
  }

  includes(region: RegionCode): boolean {
    return this.#regions.has(region);
  }

  get regions(): RegionCode[] {
    return Array.from(this.#regions);
  }

  get size(): number {
    return this.#regions.size;
  }

  equals(other: RegionSet): boolean {
    if (this.#regions.size !== other.#regions.size) {
      return false;
    }

    for (const region of this.#regions) {
      if (!other.#regions.has(region)) {
        return false;
      }
    }

    return true;
  }

  toString(): string {
    const regionNames = this.regions.map((region) => {
      switch (region) {
        case RegionCode.Hokkaido:
          return '北海道';
        case RegionCode.Tohoku:
          return '東北';
        case RegionCode.Kanto:
          return '関東';
        case RegionCode.Chubu:
          return '中部';
        case RegionCode.Kansai:
          return '関西';
        case RegionCode.Chugoku:
          return '中国';
        case RegionCode.Shikoku:
          return '四国';
        case RegionCode.Kyushu:
          return '九州';
        case RegionCode.Okinawa:
          return '沖縄';
        case RegionCode.Unknown:
          return '不明';
        default:
          return region;
      }
    });

    return regionNames.join('、');
  }

  toJSON(): any {
    return {
      regions: this.regions,
    };
  }
}
