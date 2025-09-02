export enum DeliveryBatchStatus {
  Pending = 'pending',     // 送信待ち
  Sending = 'sending',     // 送信中
  Completed = 'completed', // 送信完了
  Failed = 'failed',       // 送信失敗
}

export class DeliveryBatch {
  readonly #id: string;
  readonly #campaignId: string;
  readonly #lineBroadcastId: string | null;
  readonly #targetUserIds: ReadonlyArray<string>;
  readonly #status: DeliveryBatchStatus;
  readonly #sentCount: number;
  readonly #failCount: number;
  readonly #errorCode: string | null;
  readonly #errorMessage: string | null;
  readonly #sentAt: Date | null;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    campaignId: string,
    lineBroadcastId: string | null,
    targetUserIds: ReadonlyArray<string>,
    status: DeliveryBatchStatus,
    sentCount: number,
    failCount: number,
    errorCode: string | null,
    errorMessage: string | null,
    sentAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#campaignId = campaignId;
    this.#lineBroadcastId = lineBroadcastId;
    this.#targetUserIds = targetUserIds;
    this.#status = status;
    this.#sentCount = sentCount;
    this.#failCount = failCount;
    this.#errorCode = errorCode;
    this.#errorMessage = errorMessage;
    this.#sentAt = sentAt;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  static create(
    id: string,
    campaignId: string,
    targetUserIds: string[]
  ): DeliveryBatch {
    if (!id || id.trim().length === 0) {
      throw new Error('Delivery batch ID is required');
    }
    if (!campaignId || campaignId.trim().length === 0) {
      throw new Error('Campaign ID is required');
    }
    if (!targetUserIds || targetUserIds.length === 0) {
      throw new Error('Target user IDs are required');
    }

    // Remove duplicates and filter out empty IDs
    const uniqueUserIds = [...new Set(targetUserIds.filter(id => id && id.trim().length > 0))];
    
    if (uniqueUserIds.length === 0) {
      throw new Error('At least one valid target user ID is required');
    }

    const now = new Date();
    return new DeliveryBatch(
      id.trim(),
      campaignId.trim(),
      null,
      uniqueUserIds,
      DeliveryBatchStatus.Pending,
      0,
      0,
      null,
      null,
      null,
      now,
      now
    );
  }

  static reconstruct(
    id: string,
    campaignId: string,
    lineBroadcastId: string | null,
    targetUserIds: ReadonlyArray<string>,
    status: DeliveryBatchStatus,
    sentCount: number,
    failCount: number,
    errorCode: string | null,
    errorMessage: string | null,
    sentAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): DeliveryBatch {
    return new DeliveryBatch(
      id,
      campaignId,
      lineBroadcastId,
      targetUserIds,
      status,
      sentCount,
      failCount,
      errorCode,
      errorMessage,
      sentAt,
      createdAt,
      updatedAt
    );
  }

  get id(): string { return this.#id; }
  get campaignId(): string { return this.#campaignId; }
  get lineBroadcastId(): string | null { return this.#lineBroadcastId; }
  get targetUserIds(): ReadonlyArray<string> { return this.#targetUserIds; }
  get status(): DeliveryBatchStatus { return this.#status; }
  get sentCount(): number { return this.#sentCount; }
  get failCount(): number { return this.#failCount; }
  get errorCode(): string | null { return this.#errorCode; }
  get errorMessage(): string | null { return this.#errorMessage; }
  get sentAt(): Date | null { return this.#sentAt; }
  get createdAt(): Date { return this.#createdAt; }
  get updatedAt(): Date { return this.#updatedAt; }

  /**
   * バッチの総対象ユーザー数を取得します
   */
  get totalTargetCount(): number {
    return this.#targetUserIds.length;
  }

  /**
   * 配信成功率を計算します（0-1の範囲）
   */
  get successRate(): number {
    const totalProcessed = this.#sentCount + this.#failCount;
    if (totalProcessed === 0) {
      return 0;
    }
    return this.#sentCount / totalProcessed;
  }

  /**
   * バッチが完了しているかチェックします
   */
  get isCompleted(): boolean {
    return this.#status === DeliveryBatchStatus.Completed || 
           this.#status === DeliveryBatchStatus.Failed;
  }

  /**
   * バッチを送信中状態にマークします
   */
  markAsSending(): DeliveryBatch {
    if (this.#status !== DeliveryBatchStatus.Pending) {
      throw new Error('Only pending batches can be marked as sending');
    }

    return new DeliveryBatch(
      this.#id,
      this.#campaignId,
      this.#lineBroadcastId,
      this.#targetUserIds,
      DeliveryBatchStatus.Sending,
      this.#sentCount,
      this.#failCount,
      this.#errorCode,
      this.#errorMessage,
      this.#sentAt,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * LINE Broadcast IDを設定します
   */
  setLineBroadcastId(lineBroadcastId: string): DeliveryBatch {
    if (!lineBroadcastId || lineBroadcastId.trim().length === 0) {
      throw new Error('LINE broadcast ID is required');
    }

    return new DeliveryBatch(
      this.#id,
      this.#campaignId,
      lineBroadcastId.trim(),
      this.#targetUserIds,
      this.#status,
      this.#sentCount,
      this.#failCount,
      this.#errorCode,
      this.#errorMessage,
      this.#sentAt,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * バッチを送信完了状態にマークします
   */
  markAsCompleted(sentCount: number, failCount: number): DeliveryBatch {
    if (this.#status !== DeliveryBatchStatus.Sending) {
      throw new Error('Only sending batches can be marked as completed');
    }

    if (sentCount < 0 || failCount < 0) {
      throw new Error('Sent count and fail count must be non-negative');
    }

    if (sentCount + failCount > this.#targetUserIds.length) {
      throw new Error('Total processed count cannot exceed target count');
    }

    return new DeliveryBatch(
      this.#id,
      this.#campaignId,
      this.#lineBroadcastId,
      this.#targetUserIds,
      DeliveryBatchStatus.Completed,
      sentCount,
      failCount,
      this.#errorCode,
      this.#errorMessage,
      new Date(),
      this.#createdAt,
      new Date()
    );
  }

  /**
   * バッチを失敗状態にマークします
   */
  markAsFailed(errorCode: string, errorMessage: string): DeliveryBatch {
    if (this.#status !== DeliveryBatchStatus.Pending && this.#status !== DeliveryBatchStatus.Sending) {
      throw new Error('Only pending or sending batches can be marked as failed');
    }

    if (!errorCode || errorCode.trim().length === 0) {
      throw new Error('Error code is required');
    }
    if (!errorMessage || errorMessage.trim().length === 0) {
      throw new Error('Error message is required');
    }

    return new DeliveryBatch(
      this.#id,
      this.#campaignId,
      this.#lineBroadcastId,
      this.#targetUserIds,
      DeliveryBatchStatus.Failed,
      this.#sentCount,
      this.#failCount,
      errorCode.trim(),
      errorMessage.trim(),
      this.#sentAt,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * 配信結果を更新します（進行中の送信用）
   */
  updateDeliveryResults(sentCount: number, failCount: number): DeliveryBatch {
    if (this.#status !== DeliveryBatchStatus.Sending) {
      throw new Error('Only sending batches can have delivery results updated');
    }

    if (sentCount < 0 || failCount < 0) {
      throw new Error('Sent count and fail count must be non-negative');
    }

    if (sentCount + failCount > this.#targetUserIds.length) {
      throw new Error('Total processed count cannot exceed target count');
    }

    return new DeliveryBatch(
      this.#id,
      this.#campaignId,
      this.#lineBroadcastId,
      this.#targetUserIds,
      this.#status,
      sentCount,
      failCount,
      this.#errorCode,
      this.#errorMessage,
      this.#sentAt,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * バッチが送信可能かチェックします
   */
  canBeSent(): boolean {
    return this.#status === DeliveryBatchStatus.Pending;
  }

  /**
   * バッチがリトライ可能かチェックします
   */
  canBeRetried(): boolean {
    return this.#status === DeliveryBatchStatus.Failed;
  }

  equals(other: DeliveryBatch): boolean {
    return this.#id === other.#id;
  }

  toJSON(): any {
    return {
      id: this.#id,
      campaignId: this.#campaignId,
      lineBroadcastId: this.#lineBroadcastId,
      targetUserIds: this.#targetUserIds,
      status: this.#status,
      sentCount: this.#sentCount,
      failCount: this.#failCount,
      errorCode: this.#errorCode,
      errorMessage: this.#errorMessage,
      sentAt: this.#sentAt?.toISOString() || null,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString(),
    };
  }
}