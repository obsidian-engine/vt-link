import { RichMenu } from '../entities/RichMenu';

export interface RichMenuRepository {
  save(richMenu: RichMenu): Promise<void>;
  findById(id: string): Promise<RichMenu | null>;
  findByAccountId(accountId: string): Promise<RichMenu[]>;
  findDefaultByAccountId(accountId: string): Promise<RichMenu | null>;
  delete(id: string): Promise<void>;
  setAsDefault(id: string, accountId: string): Promise<void>;
}