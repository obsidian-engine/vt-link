import type { LineUser } from '../entities/LineUser';

export interface LineUserRepository {
  /**
   * ユーザーを保存します
   */
  save(user: LineUser): Promise<void>;

  /**
   * 複数のユーザーを一括保存します
   */
  saveBatch(users: LineUser[]): Promise<void>;

  /**
   * ユーザーIDでユーザーを検索します
   */
  findByUserId(userId: string): Promise<LineUser | null>;

  /**
   * アカウントIDでユーザーを検索します
   */
  findByAccountId(accountId: string, limit?: number, offset?: number): Promise<LineUser[]>;

  /**
   * アカウント内の全ユーザーを取得します
   */
  findAllByAccountId(accountId: string): Promise<LineUser[]>;

  /**
   * 指定された条件でユーザーをフィルタリングします
   */
  findByAccountIdWithFilters(
    accountId: string,
    filters: {
      genders?: string[];
      minAge?: number;
      maxAge?: number;
      regions?: string[];
    },
    limit?: number,
    offset?: number
  ): Promise<LineUser[]>;

  /**
   * アカウント内のユーザー数を取得します
   */
  countByAccountId(accountId: string): Promise<number>;

  /**
   * 指定された条件にマッチするユーザー数を取得します
   */
  countByAccountIdWithFilters(
    accountId: string,
    filters: {
      genders?: string[];
      minAge?: number;
      maxAge?: number;
      regions?: string[];
    }
  ): Promise<number>;

  /**
   * ユーザーを削除します
   */
  delete(userId: string): Promise<void>;

  /**
   * アカウントの全ユーザーを削除します
   */
  deleteByAccountId(accountId: string): Promise<number>;

  /**
   * アカウントのユーザー統計を取得します
   */
  getAccountUserStats(accountId: string): Promise<{
    totalUsers: number;
    genderDistribution: { [gender: string]: number };
    ageDistribution: { [ageGroup: string]: number };
    regionDistribution: { [region: string]: number };
  }>;

  /**
   * 最後に更新された時刻を取得します
   */
  getLastUpdatedAt(accountId: string): Promise<Date | null>;

  /**
   * ユーザーデータを更新します
   */
  updateUser(user: LineUser): Promise<void>;

  /**
   * 複数のユーザーを一括更新します
   */
  updateBatch(users: LineUser[]): Promise<void>;
}
