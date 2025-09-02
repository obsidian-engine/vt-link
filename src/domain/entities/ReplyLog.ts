export enum ReplyStatus {
  Success = "success",
  Failed = "failed",
  RateLimited = "rate_limited",
  TimeWindowBlocked = "time_window_blocked",
}

export class ReplyLog {
  readonly #id: string;
  readonly #ruleId: string;
  readonly #accountId: string;
  readonly #userId: string;
  readonly #groupId: string | null;
  readonly #roomId: string | null;
  readonly #messageId: string;
  readonly #matchedText: string | null;
  readonly #responseType: string;
  readonly #responseContent: string;
  readonly #status: ReplyStatus;
  readonly #error: string | null;
  readonly #latencyMs: number;
  readonly #timestamp: Date;

  private constructor(
    id: string,
    ruleId: string,
    accountId: string,
    userId: string,
    groupId: string | null,
    roomId: string | null,
    messageId: string,
    matchedText: string | null,
    responseType: string,
    responseContent: string,
    status: ReplyStatus,
    error: string | null,
    latencyMs: number,
    timestamp: Date,
  ) {
    this.#id = id;
    this.#ruleId = ruleId;
    this.#accountId = accountId;
    this.#userId = userId;
    this.#groupId = groupId;
    this.#roomId = roomId;
    this.#messageId = messageId;
    this.#matchedText = matchedText;
    this.#responseType = responseType;
    this.#responseContent = responseContent;
    this.#status = status;
    this.#error = error;
    this.#latencyMs = latencyMs;
    this.#timestamp = timestamp;
    Object.freeze(this);
  }

  static create(
    id: string,
    ruleId: string,
    accountId: string,
    userId: string,
    groupId: string | null,
    roomId: string | null,
    messageId: string,
    matchedText: string | null,
    responseType: string,
    responseContent: string,
    status: ReplyStatus,
    error: string | null = null,
    latencyMs: number,
    timestamp: Date = new Date(),
  ): ReplyLog {
    if (!id) {
      throw new Error("Log ID is required");
    }
    if (!ruleId) {
      throw new Error("Rule ID is required");
    }
    if (!accountId) {
      throw new Error("Account ID is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!messageId) {
      throw new Error("Message ID is required");
    }
    if (!responseType) {
      throw new Error("Response type is required");
    }
    if (!responseContent) {
      throw new Error("Response content is required");
    }
    if (latencyMs < 0) {
      throw new Error("Latency must be non-negative");
    }

    return new ReplyLog(
      id,
      ruleId,
      accountId,
      userId,
      groupId,
      roomId,
      messageId,
      matchedText,
      responseType,
      responseContent,
      status,
      error,
      latencyMs,
      timestamp,
    );
  }

  static reconstruct(
    id: string,
    ruleId: string,
    accountId: string,
    userId: string,
    groupId: string | null,
    roomId: string | null,
    messageId: string,
    matchedText: string | null,
    responseType: string,
    responseContent: string,
    status: ReplyStatus,
    error: string | null,
    latencyMs: number,
    timestamp: Date,
  ): ReplyLog {
    return new ReplyLog(
      id,
      ruleId,
      accountId,
      userId,
      groupId,
      roomId,
      messageId,
      matchedText,
      responseType,
      responseContent,
      status,
      error,
      latencyMs,
      timestamp,
    );
  }

  get id(): string {
    return this.#id;
  }

  get ruleId(): string {
    return this.#ruleId;
  }

  get accountId(): string {
    return this.#accountId;
  }

  get userId(): string {
    return this.#userId;
  }

  get groupId(): string | null {
    return this.#groupId;
  }

  get roomId(): string | null {
    return this.#roomId;
  }

  get messageId(): string {
    return this.#messageId;
  }

  get matchedText(): string | null {
    return this.#matchedText;
  }

  get responseType(): string {
    return this.#responseType;
  }

  get responseContent(): string {
    return this.#responseContent;
  }

  get status(): ReplyStatus {
    return this.#status;
  }

  get error(): string | null {
    return this.#error;
  }

  get latencyMs(): number {
    return this.#latencyMs;
  }

  get timestamp(): Date {
    return this.#timestamp;
  }

  isSuccess(): boolean {
    return this.#status === ReplyStatus.Success;
  }

  isFailed(): boolean {
    return this.#status === ReplyStatus.Failed;
  }

  isRateLimited(): boolean {
    return this.#status === ReplyStatus.RateLimited;
  }

  isTimeWindowBlocked(): boolean {
    return this.#status === ReplyStatus.TimeWindowBlocked;
  }

  isBlocked(): boolean {
    return this.isRateLimited() || this.isTimeWindowBlocked();
  }

  getConversationKey(): string {
    if (this.#groupId) {
      return `group:${this.#groupId}`;
    }
    if (this.#roomId) {
      return `room:${this.#roomId}`;
    }
    return `user:${this.#userId}`;
  }

  toJSON(): any {
    return {
      id: this.#id,
      ruleId: this.#ruleId,
      accountId: this.#accountId,
      userId: this.#userId,
      groupId: this.#groupId,
      roomId: this.#roomId,
      messageId: this.#messageId,
      matchedText: this.#matchedText,
      responseType: this.#responseType,
      responseContent: this.#responseContent,
      status: this.#status,
      error: this.#error,
      latencyMs: this.#latencyMs,
      timestamp: this.#timestamp.toISOString(),
    };
  }
}
