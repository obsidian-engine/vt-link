import { AutoReplyRule } from '../entities/AutoReplyRule';

export interface AutoReplyRuleRepository {
  /**
   * ルールを保存する
   */
  save(rule: AutoReplyRule): Promise<void>;

  /**
   * IDでルールを検索する
   */
  findById(id: string): Promise<AutoReplyRule | null>;

  /**
   * アカウントIDで有効なルールを優先度順に取得する
   */
  findActiveByAccountId(accountId: string): Promise<AutoReplyRule[]>;

  /**
   * アカウントIDで全てのルールを取得する
   */
  findAllByAccountId(accountId: string): Promise<AutoReplyRule[]>;

  /**
   * ルールを削除する
   */
  delete(id: string): Promise<void>;

  /**
   * アカウント内でのルールの優先度を更新する
   */
  updatePriorities(accountId: string, rulePriorities: Array<{ id: string; priority: number }>): Promise<void>;
}