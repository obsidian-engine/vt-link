import { RateLimitPolicy } from './RateLimitPolicy';

/**
 * レート制限なしのポリシー（Null Object Pattern）
 */
export class NoRateLimitPolicy implements RateLimitPolicy {
  async canExecute(ruleId: string, userId: string, groupId?: string): Promise<boolean> {
    // 常に実行可能
    return true;
  }

  async recordExecution(ruleId: string, userId: string, groupId?: string): Promise<void> {
    // 何もしない（履歴記録不要）
  }
}