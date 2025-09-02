import { MessageCampaign } from "../entities/MessageCampaign";

export interface MessageCampaignRepository {
  save(campaign: MessageCampaign): Promise<void>;
  findById(id: string): Promise<MessageCampaign | null>;
  findByAccountId(accountId: string): Promise<MessageCampaign[]>;
  findScheduledCampaigns(): Promise<MessageCampaign[]>;
  findPendingCampaigns(limit: number): Promise<MessageCampaign[]>;
  delete(id: string): Promise<void>;
}
