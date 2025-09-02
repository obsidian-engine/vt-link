/**
 * レート制限ポリシーのインターフェース
 * 「いくつまで」「どのような制約で」実行可能かの責務を担当
 */
export interface RateLimitPolicy {
  /**
   * 指定されたルールとユーザーに対して実行可能かを判定
   */
  canExecute(ruleId: string, userId: string, groupId?: string): Promise<boolean>;

  /**
   * 実行履歴を記録する
   */
  recordExecution(ruleId: string, userId: string, groupId?: string): Promise<void>;
}

/**
 * レート制限のスコープ
 */
export enum RateLimitScope {
  User = 'user',       // ユーザー単位
  Group = 'group',     // グループ単位  
  Global = 'global',   // グローバル(すべて)
}