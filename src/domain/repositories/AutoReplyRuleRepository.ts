import { AutoReplyRule } from '../entities/AutoReplyRule';

export interface AutoReplyRuleRepository {
  save(rule: AutoReplyRule): Promise<void>;
  findById(id: string): Promise<AutoReplyRule | null>;
  findByAccountId(accountId: string): Promise<AutoReplyRule[]>;
  findActiveByAccountId(accountId: string): Promise<AutoReplyRule[]>;
  findMatchingRules(accountId: string, message: string): Promise<AutoReplyRule[]>;
  delete(id: string): Promise<void>;
}