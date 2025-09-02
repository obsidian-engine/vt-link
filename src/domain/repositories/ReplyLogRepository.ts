import type { ReplyLog, ReplyStatus } from '../entities/ReplyLog';

export interface ReplyLogSearchCriteria {
  readonly accountId: string;
  readonly userId?: string;
  readonly groupId?: string;
  readonly roomId?: string;
  readonly ruleId?: string;
  readonly status?: ReplyStatus;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ReplyLogStats {
  readonly totalReplies: number;
  readonly successCount: number;
  readonly failedCount: number;
  readonly rateLimitedCount: number;
  readonly timeWindowBlockedCount: number;
  readonly averageLatencyMs: number;
}

export interface ReplyLogRepository {
  /**
   * ログを保存する
   */
  save(log: ReplyLog): Promise<void>;

  /**
   * IDでログを検索する
   */
  findById(id: string): Promise<ReplyLog | null>;

  /**
   * 条件でログを検索する
   */
  search(criteria: ReplyLogSearchCriteria): Promise<ReplyLog[]>;

  /**
   * 統計情報を取得する
   */
  getStats(criteria: Omit<ReplyLogSearchCriteria, 'limit' | 'offset'>): Promise<ReplyLogStats>;

  /**
   * 古いログを削除する（保存期間管理）
   */
  deleteOlderThan(date: Date): Promise<number>;
}
