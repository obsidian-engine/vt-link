export enum DeliveryStatus {
  Success = 'success',   // 配信成功
  Failed = 'failed',     // 配信失敗
}

export class DeliveryLog {
  readonly #id: string;
  readonly #batchId: string;
  readonly #campaignId: string;
  readonly #lineUserId: string;
  readonly #status: DeliveryStatus;
  readonly #errorCode: string | null;
  readonly #errorMessage: string | null;
  readonly #deliveredAt: Date;
  readonly #responseLatencyMs: number | null;

  private constructor(
    id: string,
    batchId: string,
    campaignId: string,
    lineUserId: string,
    status: DeliveryStatus,
    errorCode: string | null,
    errorMessage: string | null,
    deliveredAt: Date,
    responseLatencyMs: number | null
  ) {
    this.#id = id;
    this.#batchId = batchId;
    this.#campaignId = campaignId;
    this.#lineUserId = lineUserId;
    this.#status = status;
    this.#errorCode = errorCode;
    this.#errorMessage = errorMessage;
    this.#deliveredAt = deliveredAt;
    this.#responseLatencyMs = responseLatencyMs;
    Object.freeze(this);
  }

  static createSuccess(
    id: string,
    batchId: string,
    campaignId: string,
    lineUserId: string,
    responseLatencyMs?: number
  ): DeliveryLog {
    if (!id || id.trim().length === 0) {
      throw new Error('Delivery log ID is required');
    }
    if (!batchId || batchId.trim().length === 0) {
      throw new Error('Batch ID is required');
    }
    if (!campaignId || campaignId.trim().length === 0) {
      throw new Error('Campaign ID is required');
    }
    if (!lineUserId || lineUserId.trim().length === 0) {
      throw new Error('LINE user ID is required');
    }
    if (responseLatencyMs !== undefined && responseLatencyMs < 0) {
      throw new Error('Response latency must be non-negative');
    }

    return new DeliveryLog(
      id.trim(),
      batchId.trim(),
      campaignId.trim(),
      lineUserId.trim(),
      DeliveryStatus.Success,
      null,
      null,
      new Date(),
      responseLatencyMs || null
    );
  }

  static createFailure(
    id: string,
    batchId: string,
    campaignId: string,
    lineUserId: string,
    errorCode: string,
    errorMessage: string,
    responseLatencyMs?: number
  ): DeliveryLog {
    if (!id || id.trim().length === 0) {
      throw new Error('Delivery log ID is required');
    }
    if (!batchId || batchId.trim().length === 0) {
      throw new Error('Batch ID is required');
    }
    if (!campaignId || campaignId.trim().length === 0) {
      throw new Error('Campaign ID is required');
    }
    if (!lineUserId || lineUserId.trim().length === 0) {
      throw new Error('LINE user ID is required');
    }
    if (!errorCode || errorCode.trim().length === 0) {
      throw new Error('Error code is required for failed delivery');
    }
    if (!errorMessage || errorMessage.trim().length === 0) {
      throw new Error('Error message is required for failed delivery');
    }
    if (responseLatencyMs !== undefined && responseLatencyMs < 0) {
      throw new Error('Response latency must be non-negative');
    }

    return new DeliveryLog(
      id.trim(),
      batchId.trim(),
      campaignId.trim(),
      lineUserId.trim(),
      DeliveryStatus.Failed,
      errorCode.trim(),
      errorMessage.trim(),
      new Date(),
      responseLatencyMs || null
    );
  }

  static reconstruct(
    id: string,
    batchId: string,
    campaignId: string,
    lineUserId: string,
    status: DeliveryStatus,
    errorCode: string | null,
    errorMessage: string | null,
    deliveredAt: Date,
    responseLatencyMs: number | null
  ): DeliveryLog {
    return new DeliveryLog(
      id,
      batchId,
      campaignId,
      lineUserId,
      status,
      errorCode,
      errorMessage,
      deliveredAt,
      responseLatencyMs
    );
  }

  get id(): string { return this.#id; }
  get batchId(): string { return this.#batchId; }
  get campaignId(): string { return this.#campaignId; }
  get lineUserId(): string { return this.#lineUserId; }
  get status(): DeliveryStatus { return this.#status; }
  get errorCode(): string | null { return this.#errorCode; }
  get errorMessage(): string | null { return this.#errorMessage; }
  get deliveredAt(): Date { return this.#deliveredAt; }
  get responseLatencyMs(): number | null { return this.#responseLatencyMs; }

  /**
   * 配信が成功したかチェックします
   */
  get isSuccess(): boolean {
    return this.#status === DeliveryStatus.Success;
  }

  /**
   * 配信が失敗したかチェックします
   */
  get isFailed(): boolean {
    return this.#status === DeliveryStatus.Failed;
  }

  /**
   * エラーの詳細情報を取得します
   */
  get errorDetails(): { code: string; message: string } | null {
    if (this.#status === DeliveryStatus.Success) {
      return null;
    }
    return {
      code: this.#errorCode || 'UNKNOWN_ERROR',
      message: this.#errorMessage || 'Unknown error occurred',
    };
  }

  /**
   * 応答時間が記録されているかチェックします
   */
  get hasLatencyData(): boolean {
    return this.#responseLatencyMs !== null;
  }

  /**
   * 応答時間を秒単位で取得します
   */
  get responseLatencySeconds(): number | null {
    return this.#responseLatencyMs ? this.#responseLatencyMs / 1000 : null;
  }

  /**
   * 配信時刻からの経過時間を取得します（ミリ秒）
   */
  getElapsedTimeMs(currentTime = new Date()): number {
    return currentTime.getTime() - this.#deliveredAt.getTime();
  }

  /**
   * 配信時刻からの経過時間を取得します（秒）
   */
  getElapsedTimeSeconds(currentTime = new Date()): number {
    return this.getElapsedTimeMs(currentTime) / 1000;
  }

  /**
   * 指定された時間範囲内の配信かチェックします
   */
  isDeliveredWithin(startTime: Date, endTime: Date): boolean {
    return this.#deliveredAt >= startTime && this.#deliveredAt <= endTime;
  }

  /**
   * エラーコードが指定されたパターンにマッチするかチェックします
   */
  hasErrorCode(errorCodePattern: string | RegExp): boolean {
    if (this.#status === DeliveryStatus.Success || !this.#errorCode) {
      return false;
    }

    if (typeof errorCodePattern === 'string') {
      return this.#errorCode === errorCodePattern;
    }

    return errorCodePattern.test(this.#errorCode);
  }

  /**
   * 高応答時間（遅延）の配信かチェックします
   */
  isSlowDelivery(thresholdMs = 1000): boolean {
    return this.#responseLatencyMs !== null && this.#responseLatencyMs > thresholdMs;
  }

  equals(other: DeliveryLog): boolean {
    return this.#id === other.#id;
  }

  toJSON(): any {
    return {
      id: this.#id,
      batchId: this.#batchId,
      campaignId: this.#campaignId,
      lineUserId: this.#lineUserId,
      status: this.#status,
      errorCode: this.#errorCode,
      errorMessage: this.#errorMessage,
      deliveredAt: this.#deliveredAt.toISOString(),
      responseLatencyMs: this.#responseLatencyMs,
    };
  }

  /**
   * 統計用のサマリー情報を生成します
   */
  toStatsSummary(): {
    status: DeliveryStatus;
    hasError: boolean;
    responseLatencyMs: number | null;
    deliveryDate: string;
  } {
    return {
      status: this.#status,
      hasError: this.#status === DeliveryStatus.Failed,
      responseLatencyMs: this.#responseLatencyMs,
      deliveryDate: this.#deliveredAt.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  }
}