import type { DeliveryLog, DeliveryStatus } from '../entities/DeliveryLog';

export interface DeliveryLogRepository {
  /**
   * ログを保存します
   */
  save(log: DeliveryLog): Promise<void>;

  /**
   * 複数のログを一括保存します
   */
  saveBatch(logs: DeliveryLog[]): Promise<void>;

  /**
   * IDでログを検索します
   */
  findById(id: string): Promise<DeliveryLog | null>;

  /**
   * バッチIDでログを検索します
   */
  findByBatchId(batchId: string): Promise<DeliveryLog[]>;

  /**
   * キャンペーンIDでログを検索します
   */
  findByCampaignId(campaignId: string, limit?: number): Promise<DeliveryLog[]>;

  /**
   * ユーザーIDでログを検索します
   */
  findByLineUserId(lineUserId: string, limit?: number): Promise<DeliveryLog[]>;

  /**
   * 指定されたステータスのログを検索します
   */
  findByStatus(status: DeliveryStatus, limit?: number): Promise<DeliveryLog[]>;

  /**
   * 指定期間内のログを検索します
   */
  findByDateRange(startDate: Date, endDate: Date, limit?: number): Promise<DeliveryLog[]>;

  /**
   * キャンペーンと期間でログを検索します
   */
  findByCampaignIdAndDateRange(
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DeliveryLog[]>;

  /**
   * エラーコードでログを検索します
   */
  findByErrorCode(errorCode: string, limit?: number): Promise<DeliveryLog[]>;

  /**
   * 応答時間が閾値を超えるログを検索します
   */
  findSlowDeliveries(thresholdMs: number, limit?: number): Promise<DeliveryLog[]>;

  /**
   * ログを削除します（通常は古いログの削除用）
   */
  deleteByDateRange(startDate: Date, endDate: Date): Promise<number>;

  /**
   * キャンペーンの配信ログ統計を取得します
   */
  getCampaignLogStats(campaignId: string): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
    errorCodes: { [code: string]: number };
  }>;

  /**
   * バッチの配信ログ統計を取得します
   */
  getBatchLogStats(batchId: string): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
  }>;

  /**
   * 指定期間の配信ログ統計を取得します
   */
  getDateRangeLogStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
    dailyStats: Array<{
      date: string;
      totalLogs: number;
      successCount: number;
      failureCount: number;
    }>;
  }>;

  /**
   * 最も頻繁に発生しているエラーコードを取得します
   */
  getTopErrorCodes(
    limit?: number,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<
    Array<{
      errorCode: string;
      count: number;
      percentage: number;
    }>
  >;

  /**
   * 配信パフォーマンス統計を取得します
   */
  getPerformanceStats(dateRange?: { startDate: Date; endDate: Date }): Promise<{
    averageLatencyMs: number;
    medianLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    slowDeliveryCount: number;
    slowDeliveryRate: number;
  }>;
}
