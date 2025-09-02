// DEPRECATED: This MessageCampaign definition has been moved to src/domain/campaign/entities/MessageCampaign.ts
// This file remains for backward compatibility and will be removed in a future version.

export type {
  CampaignStatus as MessageStatus,
  CampaignType as MessageType,
} from '../campaign/entities/MessageCampaign';
export type { MessageContent } from '../valueObjects/MessageContent';
export { MessageCampaign } from '../campaign/entities/MessageCampaign';
