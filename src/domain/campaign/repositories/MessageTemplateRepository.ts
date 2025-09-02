import type { MessageTemplate } from '../entities/MessageTemplate';

export interface MessageTemplateRepository {
  /**
   * テンプレートを保存します
   */
  save(template: MessageTemplate): Promise<void>;

  /**
   * IDでテンプレートを検索します
   */
  findById(id: string): Promise<MessageTemplate | null>;

  /**
   * アカウントIDでテンプレートを検索します
   */
  findByAccountId(accountId: string): Promise<MessageTemplate[]>;

  /**
   * アカウントIDでアクティブなテンプレートを検索します
   */
  findActiveByAccountId(accountId: string): Promise<MessageTemplate[]>;

  /**
   * テンプレート名での部分一致検索
   */
  findByNamePattern(accountId: string, namePattern: string): Promise<MessageTemplate[]>;

  /**
   * 指定されたプレースホルダーキーを含むテンプレートを検索します
   */
  findByPlaceholderKey(accountId: string, placeholderKey: string): Promise<MessageTemplate[]>;

  /**
   * テンプレートを削除します
   */
  delete(id: string): Promise<void>;

  /**
   * アカウント内のテンプレート数を取得します
   */
  countByAccountId(accountId: string): Promise<number>;

  /**
   * アカウント内のアクティブなテンプレート数を取得します
   */
  countActiveByAccountId(accountId: string): Promise<number>;
}
