import { IncomingMessage } from './IncomingMessage';
import { MessageSpecification } from '../specifications';
import { ReplyCommand, MessageContext } from '../commands';
import { RateLimitPolicy } from '../policies';

/**
 * スリム化されたAutoReplyRule（V2）
 * Specification/Command/Policyパターンによる責務分離版
 */
export class AutoReplyRuleV2 {
  static readonly MAX_NAME_LENGTH = 100;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #priority: number;
  readonly #trigger: MessageSpecification;
  readonly #response: ReplyCommand;
  readonly #rateLimit: RateLimitPolicy | null;
  readonly #enabled: boolean;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    trigger: MessageSpecification,
    response: ReplyCommand,
    rateLimit: RateLimitPolicy | null,
    enabled: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#priority = priority;
    this.#trigger = trigger;
    this.#response = response;
    this.#rateLimit = rateLimit;
    this.#enabled = enabled;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  /**
   * 新しいルール作成（Factory Method）
   */
  static create(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    trigger: MessageSpecification,
    response: ReplyCommand,
    rateLimit: RateLimitPolicy | null = null,
    enabled: boolean = true
  ): AutoReplyRuleV2 {
    if (!id) {
      throw new Error('Rule ID is required');
    }
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Rule name is required');
    }
    if (name.length > this.MAX_NAME_LENGTH) {
      throw new Error(`Rule name cannot exceed ${this.MAX_NAME_LENGTH} characters`);
    }
    if (priority < 0) {
      throw new Error('Priority must be non-negative');
    }

    const now = new Date();
    return new AutoReplyRuleV2(
      id,
      accountId,
      name.trim(),
      priority,
      trigger,
      response,
      rateLimit,
      enabled,
      now,
      now
    );
  }

  /**
   * 既存データから再構築（Repository用）
   */
  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    priority: number,
    trigger: MessageSpecification,
    response: ReplyCommand,
    rateLimit: RateLimitPolicy | null,
    enabled: boolean,
    createdAt: Date,
    updatedAt: Date
  ): AutoReplyRuleV2 {
    return new AutoReplyRuleV2(
      id,
      accountId,
      name,
      priority,
      trigger,
      response,
      rateLimit,
      enabled,
      createdAt,
      updatedAt
    );
  }

  /**
   * メッセージを処理する（メインロジック）
   */
  async handleMessage(message: IncomingMessage): Promise<boolean> {
    if (!this.#enabled) {
      return false;
    }

    // 1. 条件判定（Specification）
    if (!this.#trigger.isSatisfiedBy(message)) {
      return false;
    }

    // 2. レート制限チェック（Policy）
    if (this.#rateLimit) {
      const canExecute = await this.#rateLimit.canExecute(
        this.#id,
        message.userId,
        message.groupId || undefined
      );
      
      if (!canExecute) {
        return false;
      }
    }

    // 3. レスポンス実行（Command）
    const context: MessageContext = {
      message,
      replyToken: message.replyToken,
      userId: message.userId,
      groupId: message.groupId || undefined,
      roomId: message.roomId || undefined
    };

    await this.#response.execute(context);

    // 4. 実行履歴記録（Policy）
    if (this.#rateLimit) {
      await this.#rateLimit.recordExecution(
        this.#id,
        message.userId,
        message.groupId || undefined
      );
    }

    return true;
  }

  /**
   * ルール名更新
   */
  updateName(name: string): AutoReplyRuleV2 {
    if (!name || name.trim().length === 0) {
      throw new Error('Rule name is required');
    }
    if (name.length > AutoReplyRuleV2.MAX_NAME_LENGTH) {
      throw new Error(`Rule name cannot exceed ${AutoReplyRuleV2.MAX_NAME_LENGTH} characters`);
    }

    return AutoReplyRuleV2.reconstruct(
      this.#id,
      this.#accountId,
      name.trim(),
      this.#priority,
      this.#trigger,
      this.#response,
      this.#rateLimit,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * 優先度更新
   */
  updatePriority(priority: number): AutoReplyRuleV2 {
    if (priority < 0) {
      throw new Error('Priority must be non-negative');
    }

    return AutoReplyRuleV2.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      priority,
      this.#trigger,
      this.#response,
      this.#rateLimit,
      this.#enabled,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * 有効化
   */
  enable(): AutoReplyRuleV2 {
    if (this.#enabled) {
      return this;
    }

    return AutoReplyRuleV2.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#trigger,
      this.#response,
      this.#rateLimit,
      true,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * 無効化
   */
  disable(): AutoReplyRuleV2 {
    if (!this.#enabled) {
      return this;
    }

    return AutoReplyRuleV2.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#priority,
      this.#trigger,
      this.#response,
      this.#rateLimit,
      false,
      this.#createdAt,
      new Date()
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

  get priority(): number {
    return this.#priority;
  }

  get trigger(): MessageSpecification {
    return this.#trigger;
  }

  get response(): ReplyCommand {
    return this.#response;
  }

  get rateLimit(): RateLimitPolicy | null {
    return this.#rateLimit;
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
}