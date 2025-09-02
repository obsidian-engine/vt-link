import { RateLimitPolicy, RateLimitScope } from './RateLimitPolicy';

/**
 * レート制限の履歴を管理するストレージインターフェース
 * Infrastructure層で実装される
 */
export interface RateLimitStorage {
  getExecutionCount(key: string, windowSeconds: number): Promise<number>;
  recordExecution(key: string): Promise<void>;
}

/**
 * スライディングウィンドウ方式のレート制限ポリシー
 */
export class SlidingWindowPolicy implements RateLimitPolicy {
  readonly #maxCount: number;
  readonly #windowSeconds: number;
  readonly #scope: RateLimitScope;
  readonly #storage: RateLimitStorage;

  constructor(
    maxCount: number,
    windowSeconds: number,
    scope: RateLimitScope,
    storage: RateLimitStorage
  ) {
    if (maxCount <= 0) {
      throw new Error('Max count must be positive');
    }
    if (windowSeconds <= 0) {
      throw new Error('Window seconds must be positive');
    }
    
    this.#maxCount = maxCount;
    this.#windowSeconds = windowSeconds;
    this.#scope = scope;
    this.#storage = storage;
  }

  async canExecute(ruleId: string, userId: string, groupId?: string): Promise<boolean> {
    const key = this.generateKey(ruleId, userId, groupId);
    const currentCount = await this.#storage.getExecutionCount(key, this.#windowSeconds);
    
    return currentCount < this.#maxCount;
  }

  async recordExecution(ruleId: string, userId: string, groupId?: string): Promise<void> {
    const key = this.generateKey(ruleId, userId, groupId);
    await this.#storage.recordExecution(key);
  }

  private generateKey(ruleId: string, userId: string, groupId?: string): string {
    switch (this.#scope) {
      case RateLimitScope.User:
        return `rate_limit:${ruleId}:user:${userId}`;
      case RateLimitScope.Group:
        return groupId 
          ? `rate_limit:${ruleId}:group:${groupId}` 
          : `rate_limit:${ruleId}:user:${userId}`;
      case RateLimitScope.Global:
        return `rate_limit:${ruleId}:global`;
      default:
        throw new Error(`Unsupported rate limit scope: ${this.#scope}`);
    }
  }

  get maxCount(): number {
    return this.#maxCount;
  }

  get windowSeconds(): number {
    return this.#windowSeconds;
  }

  get scope(): RateLimitScope {
    return this.#scope;
  }
}