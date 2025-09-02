import type { CampaignStatus, CampaignType, MessageCampaign } from '../entities/MessageCampaign';

export interface MessageCampaignRepository {
  /**
   * キャンペーンを保存します
   */
  save(campaign: MessageCampaign): Promise<void>;

  /**
   * IDでキャンペーンを検索します
   */
  findById(id: string): Promise<MessageCampaign | null>;

  /**
   * アカウントIDでキャンペーンを検索します
   */
  findByAccountId(accountId: string): Promise<MessageCampaign[]>;

  /**
   * アカウントIDで指定されたステータスのキャンペーンを検索します
   */
  findByAccountIdAndStatus(accountId: string, status: CampaignStatus): Promise<MessageCampaign[]>;

  /**
   * アカウントIDで指定されたタイプのキャンペーンを検索します
   */
  findByAccountIdAndType(accountId: string, type: CampaignType): Promise<MessageCampaign[]>;

  /**
   * 送信準備が整ったスケジュール済みキャンペーンを検索します
   */
  findScheduledReadyToSend(currentTime?: Date): Promise<MessageCampaign[]>;

  /**
   * 指定されたテンプレートを使用するキャンペーンを検索します
   */
  findByTemplateId(templateId: string): Promise<MessageCampaign[]>;

  /**
   * 指定されたセグメントを使用するキャンペーンを検索します
   */
  findBySegmentId(segmentId: string): Promise<MessageCampaign[]>;

  /**
   * キャンペーン名での部分一致検索
   */
  findByNamePattern(accountId: string, namePattern: string): Promise<MessageCampaign[]>;

  /**
   * 指定期間内に作成されたキャンペーンを検索します
   */
  findByCreatedDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MessageCampaign[]>;

  /**
   * 指定期間内に送信されたキャンペーンを検索します
   */
  findBySentDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MessageCampaign[]>;

  /**
   * キャンペーンを削除します
   */
  delete(id: string): Promise<void>;

  /**
   * アカウント内のキャンペーン数を取得します
   */
  countByAccountId(accountId: string): Promise<number>;

  /**
   * アカウント内の指定されたステータスのキャンペーン数を取得します
   */
  countByAccountIdAndStatus(accountId: string, status: CampaignStatus): Promise<number>;

  /**
   * アカウントの送信統計を取得します
   */
  getAccountStatistics(accountId: string): Promise<{
    totalCampaigns: number;
    sentCampaigns: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
  }>;
}
