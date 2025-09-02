import { DeliveryBatch, DeliveryBatchStatus } from '../entities/DeliveryBatch';

export interface DeliveryBatchRepository {
  /**
   * バッチを保存します
   */
  save(batch: DeliveryBatch): Promise<void>;

  /**
   * IDでバッチを検索します
   */
  findById(id: string): Promise<DeliveryBatch | null>;

  /**
   * キャンペーンIDでバッチを検索します
   */
  findByCampaignId(campaignId: string): Promise<DeliveryBatch[]>;

  /**
   * 指定されたステータスのバッチを検索します
   */
  findByStatus(status: DeliveryBatchStatus): Promise<DeliveryBatch[]>;

  /**
   * キャンペーンIDと指定されたステータスでバッチを検索します
   */
  findByCampaignIdAndStatus(campaignId: string, status: DeliveryBatchStatus): Promise<DeliveryBatch[]>;

  /**
   * 送信可能なバッチを検索します
   */
  findPendingBatches(limit?: number): Promise<DeliveryBatch[]>;

  /**
   * LINE Broadcast IDでバッチを検索します
   */
  findByLineBroadcastId(lineBroadcastId: string): Promise<DeliveryBatch | null>;

  /**
   * 指定期間内に作成されたバッチを検索します
   */
  findByCreatedDateRange(startDate: Date, endDate: Date): Promise<DeliveryBatch[]>;

  /**
   * 指定期間内に送信されたバッチを検索します
   */
  findBySentDateRange(startDate: Date, endDate: Date): Promise<DeliveryBatch[]>;

  /**
   * バッチを削除します
   */
  delete(id: string): Promise<void>;

  /**
   * キャンペーンの配信統計を取得します
   */
  getCampaignDeliveryStats(campaignId: string): Promise<{
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    totalTargetUsers: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
  }>;

  /**
   * 全体の配信統計を取得します（指定期間内）
   */
  getOverallDeliveryStats(startDate: Date, endDate: Date): Promise<{
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    totalTargetUsers: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
    averageLatencyMs: number;
  }>;
}