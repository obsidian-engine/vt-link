export enum RateLimitScope {
  All = "all", // 全体制限
  User = "user", // ユーザー個別制限
  Group = "group", // グループ個別制限
  Room = "room", // ルーム個別制限
}

export class RateLimit {
  readonly #scope: RateLimitScope;
  readonly #limit: number;
  readonly #windowSeconds: number;

  private constructor(
    scope: RateLimitScope,
    limit: number,
    windowSeconds: number,
  ) {
    this.#scope = scope;
    this.#limit = limit;
    this.#windowSeconds = windowSeconds;
    Object.freeze(this);
  }

  static create(
    scope: RateLimitScope,
    limit: number,
    windowSeconds: number,
  ): RateLimit {
    if (limit <= 0) {
      throw new Error("Rate limit must be greater than 0");
    }
    if (windowSeconds <= 0) {
      throw new Error("Window seconds must be greater than 0");
    }
    if (windowSeconds > 86400) {
      // 1 day max
      throw new Error("Window seconds cannot exceed 1 day (86400 seconds)");
    }

    return new RateLimit(scope, limit, windowSeconds);
  }

  static reconstruct(
    scope: RateLimitScope,
    limit: number,
    windowSeconds: number,
  ): RateLimit {
    return new RateLimit(scope, limit, windowSeconds);
  }

  get scope(): RateLimitScope {
    return this.#scope;
  }

  get limit(): number {
    return this.#limit;
  }

  get windowSeconds(): number {
    return this.#windowSeconds;
  }

  get windowMilliseconds(): number {
    return this.#windowSeconds * 1000;
  }

  generateKey(userId: string, groupId?: string, roomId?: string): string {
    switch (this.#scope) {
      case RateLimitScope.All:
        return "rate_limit:all";
      case RateLimitScope.User:
        return `rate_limit:user:${userId}`;
      case RateLimitScope.Group:
        return groupId
          ? `rate_limit:group:${groupId}`
          : `rate_limit:user:${userId}`;
      case RateLimitScope.Room:
        return roomId
          ? `rate_limit:room:${roomId}`
          : `rate_limit:user:${userId}`;
      default:
        throw new Error(`Unknown rate limit scope: ${this.#scope}`);
    }
  }

  toJSON(): any {
    return {
      scope: this.#scope,
      limit: this.#limit,
      windowSeconds: this.#windowSeconds,
    };
  }
}
