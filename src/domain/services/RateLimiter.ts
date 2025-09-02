import type { RateLimit } from '../entities/RateLimit';

export interface RateLimitCheck {
  readonly allowed: boolean;
  readonly currentCount: number;
  readonly limit: number;
  readonly resetTime: Date;
  readonly remainingCount: number;
}

export interface RateLimiter {
  /**
   * レート制限をチェックし、許可されるかどうかを確認する
   */
  check(key: string, rateLimit: RateLimit): Promise<RateLimitCheck>;

  /**
   * レート制限カウンターを増加させる
   */
  increment(key: string, rateLimit: RateLimit): Promise<void>;

  /**
   * レート制限カウンターをリセットする
   */
  reset(key: string): Promise<void>;

  /**
   * レート制限情報を取得する
   */
  getCount(key: string, rateLimit: RateLimit): Promise<number>;
}
