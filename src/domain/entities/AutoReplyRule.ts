import type { Condition } from './Condition';
import type { IncomingMessage } from './IncomingMessage';
import type { RateLimit } from './RateLimit';
import type { Response } from './Response';
import type { TimeWindow } from './TimeWindow';

export class AutoReplyRule {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_CONDITIONS = 10;
  static readonly MAX_RESPONSES = 5;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #priority: number;
  readonly #conditions: readonly Condition[];
  readonly #responses: readonly Response[];
  readonly #rateLimit: RateLimit | null;
  readonly #timeWindow: TimeWindow | null;
  readonly #enabled: boolean;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    conditions: readonly Condition[],
    responses: readonly Response[],
    rateLimit: RateLimit | null,
    timeWindow: TimeWindow | null,
    enabled: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#priority = priority;
    this.#conditions = conditions;
    this.#responses = responses;
    this.#rateLimit = rateLimit;
    this.#timeWindow = timeWindow;
    this.#enabled = enabled;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    conditions: readonly Condition[],
    responses: readonly Response[],
    rateLimit: RateLimit | null = null,
    timeWindow: TimeWindow | null = null,
    enabled = true
  ): AutoReplyRule {
    if (!id) {
      throw new Error('Rule ID is required');
    }
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Rule name is required');
    }
    if (name.length > AutoReplyRule.MAX_NAME_LENGTH) {
      throw new Error(`Rule name cannot exceed ${AutoReplyRule.MAX_NAME_LENGTH} characters`);
    }
    if (priority < 0) {
      throw new Error('Priority must be non-negative');
    }
    if (!conditions || conditions.length === 0) {
      throw new Error('At least one condition is required');
    }
    if (conditions.length > AutoReplyRule.MAX_CONDITIONS) {
      throw new Error(`Cannot exceed ${AutoReplyRule.MAX_CONDITIONS} conditions`);
    }
    if (!responses || responses.length === 0) {
      throw new Error('At least one response is required');
    }
    if (responses.length > AutoReplyRule.MAX_RESPONSES) {
      throw new Error(`Cannot exceed ${AutoReplyRule.MAX_RESPONSES} responses`);
    }

    const now = new Date();
    return new AutoReplyRule(
      id,
      accountId,
      name.trim(),
      priority,
      conditions,
      responses,
      rateLimit,
      timeWindow,
      enabled,
      now,
      now
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    conditions: readonly Condition[],
    responses: readonly Response[],
    rateLimit: RateLimit | null,
    timeWindow: TimeWindow | null,
    enabled: boolean,
    createdAt: Date,
    updatedAt: Date
  ): AutoReplyRule {
    return new AutoReplyRule(
      id,
      accountId,
      name,
      priority,
      conditions,
      responses,
      rateLimit,
      timeWindow,
      enabled,
      createdAt,
      updatedAt
    );
  }

  get id(): string {
    return this.#id;
  }

  get accountId(): string {
    return this.#accountId;
  }

  get name(): string {
    return this.#name;
  }

  get priority(): number {
    return this.#priority;
  }

  get conditions(): readonly Condition[] {
    return this.#conditions;
  }

  get responses(): readonly Response[] {
    return this.#responses;
  }

  get rateLimit(): RateLimit | null {
    return this.#rateLimit;
  }

  get timeWindow(): TimeWindow | null {
    return this.#timeWindow;
  }

  get enabled(): boolean {
    return this.#enabled;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  matches(message: IncomingMessage, currentTime: Date = new Date()): boolean {
    if (!this.#enabled) {
      return false;
    }

    // Check time window
    if (this.#timeWindow && !this.#timeWindow.contains(currentTime)) {
      return false;
    }

    // All conditions must match (AND logic)
    return this.#conditions.every((condition) => condition.matches(message));
  }

  pickResponse(): Response | null {
    if (this.#responses.length === 0) {
      return null;
    }

    // Filter responses by probability
    const availableResponses = this.#responses.filter((response) => response.shouldExecute());

    if (availableResponses.length === 0) {
      return null;
    }

    // Pick random response from available ones
    const randomIndex = Math.floor(Math.random() * availableResponses.length);
    return availableResponses[randomIndex];
  }

  getRateLimitKey(message: IncomingMessage): string | null {
    if (!this.#rateLimit) {
      return null;
    }

    return this.#rateLimit.generateKey(
      message.userId,
      message.groupId || undefined,
      message.roomId || undefined
    );
  }

  updateName(name: string): AutoReplyRule {
    if (!name || name.trim().length === 0) {
      throw new Error('Rule name is required');
    }
    if (name.length > AutoReplyRule.MAX_NAME_LENGTH) {
      throw new Error(`Rule name cannot exceed ${AutoReplyRule.MAX_NAME_LENGTH} characters`);
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      name.trim(),
      this.#priority,
      this.#conditions,
      this.#responses,
      this.#rateLimit,
      this.#timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  updatePriority(priority: number): AutoReplyRule {
    if (priority < 0) {
      throw new Error('Priority must be non-negative');
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      priority,
      this.#conditions,
      this.#responses,
      this.#rateLimit,
      this.#timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  updateConditions(conditions: readonly Condition[]): AutoReplyRule {
    if (!conditions || conditions.length === 0) {
      throw new Error('At least one condition is required');
    }
    if (conditions.length > AutoReplyRule.MAX_CONDITIONS) {
      throw new Error(`Cannot exceed ${AutoReplyRule.MAX_CONDITIONS} conditions`);
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      conditions,
      this.#responses,
      this.#rateLimit,
      this.#timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  updateResponses(responses: readonly Response[]): AutoReplyRule {
    if (!responses || responses.length === 0) {
      throw new Error('At least one response is required');
    }
    if (responses.length > AutoReplyRule.MAX_RESPONSES) {
      throw new Error(`Cannot exceed ${AutoReplyRule.MAX_RESPONSES} responses`);
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#conditions,
      responses,
      this.#rateLimit,
      this.#timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  updateRateLimit(rateLimit: RateLimit | null): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#conditions,
      this.#responses,
      rateLimit,
      this.#timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  updateTimeWindow(timeWindow: TimeWindow | null): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#conditions,
      this.#responses,
      this.#rateLimit,
      timeWindow,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  enable(): AutoReplyRule {
    if (this.#enabled) {
      return this;
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#conditions,
      this.#responses,
      this.#rateLimit,
      this.#timeWindow,
      true,
      this.#createdAt,
      new Date()
    );
  }

  disable(): AutoReplyRule {
    if (!this.#enabled) {
      return this;
    }

    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#conditions,
      this.#responses,
      this.#rateLimit,
      this.#timeWindow,
      false,
      this.#createdAt,
      new Date()
    );
  }

  canBeExecuted(currentTime: Date = new Date()): boolean {
    return this.#enabled && (this.#timeWindow === null || this.#timeWindow.contains(currentTime));
  }
}
