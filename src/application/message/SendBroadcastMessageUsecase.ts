import {
  MessageCampaign,
  MessageContent,
} from "@/domain/entities/MessageCampaign";
import { MessageCampaignRepository } from "@/domain/repositories/MessageCampaignRepository";

export interface BroadcastPort {
  sendBroadcast(
    content: ReadonlyArray<MessageContent>,
  ): Promise<{ sentCount: number }>;
}

export interface SendBroadcastMessageInput {
  readonly accountId: string;
  readonly name: string;
  readonly content: ReadonlyArray<MessageContent>;
  readonly scheduledAt?: Date;
}

export interface SendBroadcastMessageOutput {
  readonly id: string;
  readonly status: "sent" | "scheduled";
  readonly sentCount?: number;
}

export class SendBroadcastMessageUsecase {
  constructor(
    private readonly messageCampaignRepository: MessageCampaignRepository,
    private readonly broadcastPort: BroadcastPort,
  ) {}

  async execute(
    input: SendBroadcastMessageInput,
  ): Promise<SendBroadcastMessageOutput> {
    const id = crypto.randomUUID();

    let campaign = MessageCampaign.create(
      id,
      input.accountId,
      input.name,
      "broadcast",
      input.content,
    );

    if (input.scheduledAt) {
      campaign = campaign.schedule(input.scheduledAt);
      await this.messageCampaignRepository.save(campaign);

      return {
        id: campaign.id,
        status: "scheduled",
      };
    }

    if (!campaign.canBeSent()) {
      throw new Error("Campaign cannot be sent in current state");
    }

    campaign = campaign.markAsSending();
    await this.messageCampaignRepository.save(campaign);

    try {
      const result = await this.broadcastPort.sendBroadcast(campaign.content);

      campaign = campaign.markAsSent(result.sentCount);
      await this.messageCampaignRepository.save(campaign);

      return {
        id: campaign.id,
        status: "sent",
        sentCount: result.sentCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      campaign = campaign.markAsFailed(errorMessage);
      await this.messageCampaignRepository.save(campaign);

      throw error;
    }
  }
}
