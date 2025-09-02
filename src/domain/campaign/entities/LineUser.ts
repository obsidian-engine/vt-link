import { Gender } from '@/domain/valueObjects/Gender';
import { RegionCode } from '@/domain/valueObjects/Region';

export class LineUser {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly lineUserId: string,
    public readonly displayName: string,
    public readonly pictureUrl: string | null,
    public readonly statusMessage: string | null,
    public readonly language: string | null,
    public readonly gender: Gender | null,
    public readonly age: number | null,
    public readonly region: RegionCode | null,
    public readonly isFriend: boolean,
    public readonly blockedAt: Date | undefined,
    public readonly createdAt: Date
  ) {}

  /**
   * 既存のデータからLineUserエンティティを再構築
   */
  static reconstruct(
    id: string,
    accountId: string,
    lineUserId: string,
    displayName: string,
    pictureUrl: string | null,
    statusMessage: string | null,
    language: string | null,
    gender: Gender | null,
    age: number | null,
    region: RegionCode | null,
    isFriend: boolean,
    blockedAt: Date | undefined,
    createdAt: Date
  ): LineUser {
    return new LineUser(
      id,
      accountId,
      lineUserId,
      displayName,
      pictureUrl,
      statusMessage,
      language,
      gender,
      age,
      region,
      isFriend,
      blockedAt,
      createdAt
    );
  }

  /**
   * 新しいLINEユーザーを作成
   */
  static create(
    accountId: string,
    lineUserId: string,
    displayName: string,
    pictureUrl?: string | null,
    statusMessage?: string | null,
    language?: string | null,
    gender?: Gender | null,
    age?: number | null,
    region?: Region | null
  ): LineUser {
    return new LineUser(
      crypto.randomUUID(),
      accountId,
      lineUserId,
      displayName,
      pictureUrl ?? null,
      statusMessage ?? null,
      language ?? null,
      gender ?? null,
      age ?? null,
      region ?? null,
      true, // 新規ユーザーは友達状態でスタート
      undefined, // ブロックされていない
      new Date()
    );
  }

  /**
   * ユーザーがアクティブ（友達で、ブロックされていない）かどうか
   */
  get isActive(): boolean {
    return this.isFriend && this.blockedAt === undefined;
  }

  /**
   * 友達状態を更新
   */
  updateFriendStatus(isFriend: boolean): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      this.displayName,
      this.pictureUrl,
      this.statusMessage,
      this.language,
      this.gender,
      this.age,
      this.region,
      isFriend,
      isFriend ? undefined : new Date(), // 友達解除時は現在時刻でブロック
      this.createdAt
    );
  }

  /**
   * プロフィール情報を更新
   */
  updateProfile(
    displayName?: string,
    pictureUrl?: string | null,
    statusMessage?: string | null,
    language?: string | null,
    gender?: Gender | null,
    age?: number | null,
    region?: Region | null
  ): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      displayName ?? this.displayName,
      pictureUrl !== undefined ? pictureUrl : this.pictureUrl,
      statusMessage !== undefined ? statusMessage : this.statusMessage,
      language !== undefined ? language : this.language,
      gender !== undefined ? gender : this.gender,
      age !== undefined ? age : this.age,
      region !== undefined ? region : this.region,
      this.isFriend,
      this.blockedAt,
      this.createdAt
    );
  }

  /**
   * 年代を取得（統計用）
   */
  get ageGroup(): string {
    if (!this.age) return 'unknown';
    if (this.age < 20) return '10代';
    if (this.age < 30) return '20代';
    if (this.age < 40) return '30代';
    if (this.age < 50) return '40代';
    if (this.age < 60) return '50代';
    return '60代以上';
  }

  /**
   * エンティティの等価性チェック
   */
  equals(other: LineUser): boolean {
    return this.id === other.id;
  }

  /**
   * デバッグ用の文字列表現
   */
  toString(): string {
    return `LineUser(${this.id}, ${this.displayName}, ${this.lineUserId})`;
  }
}