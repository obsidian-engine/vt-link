import { SegmentCriteria } from '../../valueObjects/SegmentCriteria';
import { Gender } from '../../valueObjects/Gender';
import { RegionCode } from '../../valueObjects/Region';

export interface LineUser {
  readonly userId: string;
  readonly gender: Gender;
  readonly age: number;
  readonly region: RegionCode;
}

export class TargetSegment {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_DESCRIPTION_LENGTH = 500;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #description: string;
  readonly #criteria: SegmentCriteria;
  readonly #isActive: boolean;
  readonly #estimatedSize: number;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    description: string,
    criteria: SegmentCriteria,
    isActive: boolean,
    estimatedSize: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#description = description;
    this.#criteria = criteria;
    this.#isActive = isActive;
    this.#estimatedSize = estimatedSize;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    description: string,
    criteria: SegmentCriteria
  ): TargetSegment {
    if (!id || id.trim().length === 0) {
      throw new Error('Segment ID is required');
    }
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Segment name is required');
    }
    if (name.length > this.MAX_NAME_LENGTH) {
      throw new Error(`Segment name cannot exceed ${this.MAX_NAME_LENGTH} characters`);
    }
    if (description && description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Segment description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }
    if (criteria.isEmpty()) {
      throw new Error('Segment criteria cannot be empty');
    }

    const now = new Date();
    return new TargetSegment(
      id.trim(),
      accountId.trim(),
      name.trim(),
      description?.trim() || '',
      criteria,
      true,
      0, // Initial estimate, will be updated later
      now,
      now
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    description: string,
    criteria: SegmentCriteria,
    isActive: boolean,
    estimatedSize: number,
    createdAt: Date,
    updatedAt: Date
  ): TargetSegment {
    return new TargetSegment(
      id,
      accountId,
      name,
      description,
      criteria,
      isActive,
      estimatedSize,
      createdAt,
      updatedAt
    );
  }

  get id(): string {
    return this.#id;
  }

  get accountId(): string {
    return this.#accountId;
  }

  get name(): string {
    return this.#name;
  }

  get description(): string {
    return this.#description;
  }

  get criteria(): SegmentCriteria {
    return this.#criteria;
  }

  get isActive(): boolean {
    return this.#isActive;
  }

  get estimatedSize(): number {
    return this.#estimatedSize;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * セグメントを更新します
   */
  update(
    name?: string,
    description?: string,
    criteria?: SegmentCriteria
  ): TargetSegment {
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new Error('Segment name is required');
      }
      if (name.length > TargetSegment.MAX_NAME_LENGTH) {
        throw new Error(`Segment name cannot exceed ${TargetSegment.MAX_NAME_LENGTH} characters`);
      }
    }

    if (description !== undefined && description.length > TargetSegment.MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Segment description cannot exceed ${TargetSegment.MAX_DESCRIPTION_LENGTH} characters`);
    }

    if (criteria !== undefined && criteria.isEmpty()) {
      throw new Error('Segment criteria cannot be empty');
    }

    const newName = name?.trim() || this.#name;
    const newDescription = description?.trim() || this.#description;
    const newCriteria = criteria || this.#criteria;

    return new TargetSegment(
      this.#id,
      this.#accountId,
      newName,
      newDescription,
      newCriteria,
      this.#isActive,
      this.#estimatedSize,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * セグメントを無効化します
   */
  deactivate(): TargetSegment {
    if (!this.#isActive) {
      return this;
    }

    return new TargetSegment(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#criteria,
      false,
      this.#estimatedSize,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * セグメントを有効化します
   */
  activate(): TargetSegment {
    if (this.#isActive) {
      return this;
    }

    return new TargetSegment(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#criteria,
      true,
      this.#estimatedSize,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * 推定サイズを更新します
   */
  updateEstimatedSize(size: number): TargetSegment {
    if (size < 0) {
      throw new Error('Estimated size cannot be negative');
    }

    return new TargetSegment(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#criteria,
      this.#isActive,
      size,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * ユーザーがこのセグメントの対象になるかをチェックします
   */
  matches(user: LineUser): boolean {
    return this.#criteria.matches({
      gender: user.gender,
      age: user.age,
      region: user.region,
    });
  }

  /**
   * ユーザーリストからこのセグメントに一致するユーザーをフィルタリングします
   */
  filterUsers(users: LineUser[]): LineUser[] {
    return users.filter(user => this.matches(user));
  }

  /**
   * ユーザーリストからこのセグメントに一致するユーザーIDのみを抽出します
   */
  filterUserIds(users: LineUser[]): string[] {
    return this.filterUsers(users).map(user => user.userId);
  }

  /**
   * 指定されたユーザーリストに対するこのセグメントのマッチ率を計算します（0-1の範囲）
   */
  calculateMatchRate(users: LineUser[]): number {
    if (users.length === 0) {
      return 0;
    }

    const matchedUsers = this.filterUsers(users);
    return matchedUsers.length / users.length;
  }

  equals(other: TargetSegment): boolean {
    return this.#id === other.#id &&
           this.#accountId === other.#accountId;
  }

  toJSON(): any {
    return {
      id: this.#id,
      accountId: this.#accountId,
      name: this.#name,
      description: this.#description,
      criteria: this.#criteria.toJSON(),
      isActive: this.#isActive,
      estimatedSize: this.#estimatedSize,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString(),
    };
  }
}