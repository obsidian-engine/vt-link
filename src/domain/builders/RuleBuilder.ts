import { AutoReplyRuleV2 } from "../entities/AutoReplyRuleV2";
import type { MessageSpecification } from "../specifications";
import type { ReplyCommand } from "../commands";
import type { RateLimitPolicy, RateLimitStorage } from "../policies";
import {
  RateLimitScope,
  SlidingWindowPolicy,
  NoRateLimitPolicy,
} from "../policies";

/**
 * AutoReplyRuleを直感的に組み立てるBuilderクラス
 */
export class RuleBuilder {
  private id?: string;
  private accountId?: string;
  private name?: string;
  private priority?: number;
  private trigger?: MessageSpecification;
  private response?: ReplyCommand;
  private rateLimit?: RateLimitPolicy;
  private enabled: boolean = true;

  /**
   * ルールIDを設定
   */
  setId(id: string): RuleBuilder {
    this.id = id;
    return this;
  }

  /**
   * アカウントIDを設定
   */
  forAccount(accountId: string): RuleBuilder {
    this.accountId = accountId;
    return this;
  }

  /**
   * ルール名を設定
   */
  named(name: string): RuleBuilder {
    this.name = name;
    return this;
  }

  /**
   * 優先度を設定
   */
  withPriority(priority: number): RuleBuilder {
    this.priority = priority;
    return this;
  }

  /**
   * 発火条件を設定（Specification）
   */
  when(specification: MessageSpecification): RuleBuilder {
    this.trigger = specification;
    return this;
  }

  /**
   * 実行アクションを設定（Command）
   */
  then(command: ReplyCommand): RuleBuilder {
    this.response = command;
    return this;
  }

  /**
   * レート制限を設定（Policy）
   */
  limitTo(
    maxCount: number,
    windowSeconds: number,
    scope: RateLimitScope = RateLimitScope.User,
    storage?: RateLimitStorage,
  ): RuleBuilder {
    if (!storage) {
      throw new Error("RateLimitStorage is required for rate limiting");
    }

    this.rateLimit = new SlidingWindowPolicy(
      maxCount,
      windowSeconds,
      scope,
      storage,
    );
    return this;
  }

  /**
   * レート制限なしを明示的に設定
   */
  noRateLimit(): RuleBuilder {
    this.rateLimit = new NoRateLimitPolicy();
    return this;
  }

  /**
   * 有効/無効を設定
   */
  setEnabled(enabled: boolean = true): RuleBuilder {
    this.enabled = enabled;
    return this;
  }

  /**
   * ルール構築
   */
  build(): AutoReplyRuleV2 {
    if (!this.id) {
      this.id = crypto.randomUUID();
    }
    if (!this.accountId) {
      throw new Error("Account ID is required");
    }
    if (!this.name) {
      throw new Error("Rule name is required");
    }
    if (!this.trigger) {
      throw new Error("Trigger specification is required");
    }
    if (!this.response) {
      throw new Error("Response command is required");
    }
    if (this.priority === undefined) {
      this.priority = 0;
    }

    return AutoReplyRuleV2.create(
      this.id,
      this.accountId,
      this.name,
      this.priority,
      this.trigger,
      this.response,
      this.rateLimit,
      this.enabled,
    );
  }

  /**
   * 静的ファクトリーメソッド - Builderのエントリーポイント
   */
  static create(): RuleBuilder {
    return new RuleBuilder();
  }

  /**
   * 条件指定から開始する簡便メソッド
   */
  static when(specification: MessageSpecification): RuleBuilder {
    return new RuleBuilder().when(specification);
  }
}
