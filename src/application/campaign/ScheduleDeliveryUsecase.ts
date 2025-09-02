import { MessageCampaignRepository } from "@/domain/campaign/repositories/MessageCampaignRepository";

export interface ScheduleDeliveryInput {
  readonly campaignId: string;
  readonly scheduledAt: Date;
}

export interface ScheduleDeliveryOutput {
  readonly id: string;
  readonly name: string;
  readonly scheduledAt: Date;
  readonly status: string;
  readonly updatedAt: Date;
  readonly batchesCreated: number;
  readonly totalRecipients: number;
}

export class ScheduleDeliveryUsecase {
  readonly #campaignRepository: MessageCampaignRepository;

  constructor(campaignRepository: MessageCampaignRepository) {
    this.#campaignRepository = campaignRepository;
  }

  async execute(input: ScheduleDeliveryInput): Promise<ScheduleDeliveryOutput> {
    // Input validation
    if (!input.campaignId || input.campaignId.trim().length === 0) {
      throw new Error("Campaign ID is required");
    }
    if (!input.scheduledAt) {
      throw new Error("Scheduled time is required");
    }
    if (input.scheduledAt <= new Date()) {
      throw new Error("Scheduled time must be in the future");
    }

    // Find campaign
    const campaign = await this.#campaignRepository.findById(input.campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${input.campaignId}`);
    }

    // Check if campaign can be scheduled
    if (!campaign.canBeEdited()) {
      throw new Error("Campaign cannot be scheduled in its current state");
    }

    // Schedule the campaign
    const scheduledCampaign = campaign.schedule(input.scheduledAt);

    // Save updated campaign
    await this.#campaignRepository.save(scheduledCampaign);

    return {
      id: scheduledCampaign.id,
      name: scheduledCampaign.name,
      scheduledAt: scheduledCampaign.scheduledAt!,
      status: scheduledCampaign.status,
      updatedAt: scheduledCampaign.updatedAt,
      batchesCreated: 0, // TODO: 実装時に正しい値を設定
      totalRecipients: 0, // TODO: 実装時に正しい値を設定
    };
  }
}
