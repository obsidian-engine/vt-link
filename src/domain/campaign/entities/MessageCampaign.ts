import type { MessageContent } from '../../valueObjects/MessageContent';
import { PlaceholderData } from '../../valueObjects/PlaceholderData';

export enum CampaignType {
  Broadcast = 'broadcast', // 全員配信
  Segment = 'segment', // セグメント配信
}

export enum CampaignStatus {
  Draft = 'draft', // 下書き
  Scheduled = 'scheduled', // 配信予約済み
  Sending = 'sending', // 配信中
  Sent = 'sent', // 配信完了
  Failed = 'failed', // 配信失敗
  Cancelled = 'cancelled', // キャンセル
}

export interface CampaignSettings {
  readonly retryCount: number;
  readonly retryIntervalMinutes: number;
  readonly enableDeliveryTracking: boolean;
}

export class MessageCampaign {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_DESCRIPTION_LENGTH = 500;
  static readonly DEFAULT_RETRY_COUNT = 3;
  static readonly DEFAULT_RETRY_INTERVAL_MINUTES = 5;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #description: string;
  readonly #type: CampaignType;
  readonly #templateId: string | null;
  readonly #segmentId: string | null;
  readonly #content: MessageContent;
  readonly #placeholderData: PlaceholderData;
  readonly #scheduledAt: Date | null;
  readonly #status: CampaignStatus;
  readonly #settings: CampaignSettings;
  readonly #sentCount: number;
  readonly #failCount: number;
  readonly #sentAt: Date | null;
  readonly #failureReason: string | null;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    description: string,
    type: CampaignType,
    templateId: string | null,
    segmentId: string | null,
    content: MessageContent,
    placeholderData: PlaceholderData,
    scheduledAt: Date | null,
    status: CampaignStatus,
    settings: CampaignSettings,
    sentCount: number,
    failCount: number,
    sentAt: Date | null,
    failureReason: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#description = description;
    this.#type = type;
    this.#templateId = templateId;
    this.#segmentId = segmentId;
    this.#content = content;
    this.#placeholderData = placeholderData;
    this.#scheduledAt = scheduledAt;
    this.#status = status;
    this.#settings = settings;
    this.#sentCount = sentCount;
    this.#failCount = failCount;
    this.#sentAt = sentAt;
    this.#failureReason = failureReason;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    description: string,
    type: CampaignType,
    content: MessageContent,
    templateId?: string,
    segmentId?: string,
    placeholderData?: PlaceholderData
  ): MessageCampaign {
    if (!id || id.trim().length === 0) {
      throw new Error('Campaign ID is required');
    }
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Campaign name is required');
    }
    if (name.length > MessageCampaign.MAX_NAME_LENGTH) {
      throw new Error(`Campaign name cannot exceed ${MessageCampaign.MAX_NAME_LENGTH} characters`);
    }
    if (description && description.length > MessageCampaign.MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Campaign description cannot exceed ${MessageCampaign.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
    if (type === CampaignType.Segment && !segmentId) {
      throw new Error('Segment ID is required for segment campaigns');
    }

    const defaultSettings: CampaignSettings = {
      retryCount: MessageCampaign.DEFAULT_RETRY_COUNT,
      retryIntervalMinutes: MessageCampaign.DEFAULT_RETRY_INTERVAL_MINUTES,
      enableDeliveryTracking: true,
    };

    const now = new Date();
    return new MessageCampaign(
      id.trim(),
      accountId.trim(),
      name.trim(),
      description?.trim() || '',
      type,
      templateId?.trim() || null,
      segmentId?.trim() || null,
      content,
      placeholderData || PlaceholderData.createEmpty(),
      null,
      CampaignStatus.Draft,
      defaultSettings,
      0,
      0,
      null,
      null,
      now,
      now
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    description: string,
    type: CampaignType,
    templateId: string | null,
    segmentId: string | null,
    content: MessageContent,
    placeholderData: PlaceholderData,
    scheduledAt: Date | null,
    status: CampaignStatus,
    settings: CampaignSettings,
    sentCount: number,
    failCount: number,
    sentAt: Date | null,
    failureReason: string | null,
    createdAt: Date,
    updatedAt: Date
  ): MessageCampaign {
    return new MessageCampaign(
      id,
      accountId,
      name,
      description,
      type,
      templateId,
      segmentId,
      content,
      placeholderData,
      scheduledAt,
      status,
      settings,
      sentCount,
      failCount,
      sentAt,
      failureReason,
      createdAt,
      updatedAt
    );
  }

  // Getters
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
  get type(): CampaignType {
    return this.#type;
  }
  get templateId(): string | null {
    return this.#templateId;
  }
  get segmentId(): string | null {
    return this.#segmentId;
  }
  get content(): MessageContent {
    return this.#content;
  }
  get placeholderData(): PlaceholderData {
    return this.#placeholderData;
  }
  get scheduledAt(): Date | null {
    return this.#scheduledAt;
  }
  get status(): CampaignStatus {
    return this.#status;
  }
  get settings(): CampaignSettings {
    return this.#settings;
  }
  get sentCount(): number {
    return this.#sentCount;
  }
  get failCount(): number {
    return this.#failCount;
  }
  get sentAt(): Date | null {
    return this.#sentAt;
  }
  get failureReason(): string | null {
    return this.#failureReason;
  }
  get createdAt(): Date {
    return this.#createdAt;
  }
  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * キャンペーンを更新します
   */
  update(
    name?: string,
    description?: string,
    content?: MessageContent,
    placeholderData?: PlaceholderData
  ): MessageCampaign {
    if (this.#status !== CampaignStatus.Draft) {
      throw new Error('Only draft campaigns can be updated');
    }

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new Error('Campaign name is required');
      }
      if (name.length > MessageCampaign.MAX_NAME_LENGTH) {
        throw new Error(
          `Campaign name cannot exceed ${MessageCampaign.MAX_NAME_LENGTH} characters`
        );
      }
    }

    if (description !== undefined && description.length > MessageCampaign.MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Campaign description cannot exceed ${MessageCampaign.MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      name?.trim() || this.#name,
      description?.trim() || this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      content || this.#content,
      placeholderData || this.#placeholderData,
      this.#scheduledAt,
      this.#status,
      this.#settings,
      this.#sentCount,
      this.#failCount,
      this.#sentAt,
      this.#failureReason,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンをスケジュールします
   */
  schedule(scheduledAt: Date): MessageCampaign {
    if (this.#status !== CampaignStatus.Draft) {
      throw new Error('Only draft campaigns can be scheduled');
    }

    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      this.#content,
      this.#placeholderData,
      scheduledAt,
      CampaignStatus.Scheduled,
      this.#settings,
      this.#sentCount,
      this.#failCount,
      this.#sentAt,
      this.#failureReason,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンを送信開始状態にマークします
   */
  markAsSending(): MessageCampaign {
    if (this.#status !== CampaignStatus.Draft && this.#status !== CampaignStatus.Scheduled) {
      throw new Error('Only draft or scheduled campaigns can be marked as sending');
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      this.#content,
      this.#placeholderData,
      this.#scheduledAt,
      CampaignStatus.Sending,
      this.#settings,
      this.#sentCount,
      this.#failCount,
      this.#sentAt,
      this.#failureReason,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンを送信完了状態にマークします
   */
  markAsSent(sentCount: number, failCount = 0): MessageCampaign {
    if (this.#status !== CampaignStatus.Sending) {
      throw new Error('Only sending campaigns can be marked as sent');
    }

    if (sentCount < 0 || failCount < 0) {
      throw new Error('Sent count and fail count must be non-negative');
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      this.#content,
      this.#placeholderData,
      this.#scheduledAt,
      CampaignStatus.Sent,
      this.#settings,
      sentCount,
      failCount,
      new Date(),
      null,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンを失敗状態にマークします
   */
  markAsFailed(failureReason: string): MessageCampaign {
    if (this.#status !== CampaignStatus.Sending) {
      throw new Error('Only sending campaigns can be marked as failed');
    }

    if (!failureReason || failureReason.trim().length === 0) {
      throw new Error('Failure reason is required');
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      this.#content,
      this.#placeholderData,
      this.#scheduledAt,
      CampaignStatus.Failed,
      this.#settings,
      this.#sentCount,
      this.#failCount,
      this.#sentAt,
      failureReason.trim(),
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンをキャンセルします
   */
  cancel(): MessageCampaign {
    if (this.#status !== CampaignStatus.Draft && this.#status !== CampaignStatus.Scheduled) {
      throw new Error('Only draft or scheduled campaigns can be cancelled');
    }

    return new MessageCampaign(
      this.#id,
      this.#accountId,
      this.#name,
      this.#description,
      this.#type,
      this.#templateId,
      this.#segmentId,
      this.#content,
      this.#placeholderData,
      this.#scheduledAt,
      CampaignStatus.Cancelled,
      this.#settings,
      this.#sentCount,
      this.#failCount,
      this.#sentAt,
      this.#failureReason,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * キャンペーンが送信可能かチェックします
   */
  canBeSent(): boolean {
    return this.#status === CampaignStatus.Draft || this.#status === CampaignStatus.Scheduled;
  }

  /**
   * キャンペーンが編集可能かチェックします
   */
  canBeEdited(): boolean {
    return this.#status === CampaignStatus.Draft;
  }

  /**
   * キャンペーンがキャンセル可能かチェックします
   */
  canBeCancelled(): boolean {
    return this.#status === CampaignStatus.Draft || this.#status === CampaignStatus.Scheduled;
  }

  /**
   * スケジュール済みキャンペーンが送信時刻になったかチェックします
   */
  isReadyToSend(currentTime = new Date()): boolean {
    return (
      this.#status === CampaignStatus.Scheduled &&
      this.#scheduledAt !== null &&
      this.#scheduledAt <= currentTime
    );
  }

  /**
   * 配信成功率を計算します（0-1の範囲）
   */
  getSuccessRate(): number {
    const totalSent = this.#sentCount + this.#failCount;
    if (totalSent === 0) {
      return 0;
    }
    return this.#sentCount / totalSent;
  }

  equals(other: MessageCampaign): boolean {
    return this.#id === other.#id && this.#accountId === other.#accountId;
  }

  toJSON(): any {
    return {
      id: this.#id,
      accountId: this.#accountId,
      name: this.#name,
      description: this.#description,
      type: this.#type,
      templateId: this.#templateId,
      segmentId: this.#segmentId,
      content: this.#content.toJSON(),
      placeholderData: this.#placeholderData.toJSON(),
      scheduledAt: this.#scheduledAt?.toISOString() || null,
      status: this.#status,
      settings: this.#settings,
      sentCount: this.#sentCount,
      failCount: this.#failCount,
      sentAt: this.#sentAt?.toISOString() || null,
      failureReason: this.#failureReason,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString(),
    };
  }
}
