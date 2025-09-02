import { DeliveryBatch } from '@/domain/campaign/entities/DeliveryBatch';
import { CampaignType } from '@/domain/campaign/entities/MessageCampaign';
import type { DeliveryBatchRepository } from '@/domain/campaign/repositories/DeliveryBatchRepository';
import type { LineUserRepository } from '@/domain/campaign/repositories/LineUserRepository';
import type { MessageCampaignRepository } from '@/domain/campaign/repositories/MessageCampaignRepository';
import type { TargetSegmentRepository } from '@/domain/campaign/repositories/TargetSegmentRepository';

export interface LineBroadcastService {
  sendBroadcast(content: any): Promise<{ broadcastId: string; sentCount: number }>;
  sendNarrowcast(
    content: any,
    userIds: string[]
  ): Promise<{ broadcastId: string; sentCount: number }>;
}

export interface SendNowInput {
  readonly campaignId: string;
}

export interface SendNowOutput {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly batchId: string;
  readonly targetCount: number;
  readonly sentAt: Date;
}

export class SendNowUsecase {
  readonly #campaignRepository: MessageCampaignRepository;
  readonly #batchRepository: DeliveryBatchRepository;
  readonly #segmentRepository: TargetSegmentRepository;
  readonly #userRepository: LineUserRepository;
  readonly #broadcastService: LineBroadcastService;

  constructor(
    campaignRepository: MessageCampaignRepository,
    batchRepository: DeliveryBatchRepository,
    segmentRepository: TargetSegmentRepository,
    userRepository: LineUserRepository,
    broadcastService: LineBroadcastService
  ) {
    this.#campaignRepository = campaignRepository;
    this.#batchRepository = batchRepository;
    this.#segmentRepository = segmentRepository;
    this.#userRepository = userRepository;
    this.#broadcastService = broadcastService;
  }

  async execute(input: SendNowInput): Promise<SendNowOutput> {
    // Input validation
    if (!input.campaignId || input.campaignId.trim().length === 0) {
      throw new Error('Campaign ID is required');
    }

    // Find campaign
    const campaign = await this.#campaignRepository.findById(input.campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${input.campaignId}`);
    }

    // Check if campaign can be sent
    if (!campaign.canBeSent()) {
      throw new Error('Campaign cannot be sent in its current state');
    }

    // Mark campaign as sending
    const sendingCampaign = campaign.markAsSending();
    await this.#campaignRepository.save(sendingCampaign);

    try {
      // Determine target users
      let targetUserIds: string[];

      if (campaign.type === CampaignType.Broadcast) {
        // Get all users for the account
        const allUsers = await this.#userRepository.findAllByAccountId(campaign.accountId);
        targetUserIds = allUsers.map((user) => user.lineUserId);
      } else if (campaign.type === CampaignType.Segment) {
        if (!campaign.segmentId) {
          throw new Error('Segment ID is required for segment campaigns');
        }

        // Get segment
        const segment = await this.#segmentRepository.findById(campaign.segmentId);
        if (!segment) {
          throw new Error(`Segment not found: ${campaign.segmentId}`);
        }

        // Get all users and filter by segment
        const allUsers = await this.#userRepository.findAllByAccountId(campaign.accountId);
        targetUserIds = segment.filterUserIds(allUsers);
      } else {
        throw new Error(`Unsupported campaign type: ${campaign.type}`);
      }

      if (targetUserIds.length === 0) {
        throw new Error('No target users found for this campaign');
      }

      // Create delivery batch
      const batchId = crypto.randomUUID();
      const batch = DeliveryBatch.create(batchId, campaign.id, targetUserIds);
      const sendingBatch = batch.markAsSending();
      await this.#batchRepository.save(sendingBatch);

      // Prepare message content for LINE API
      const messageContent = this.prepareMessageContent(campaign);

      // Send via LINE API
      let broadcastResult: { broadcastId: string; sentCount: number };

      if (campaign.type === CampaignType.Broadcast) {
        broadcastResult = await this.#broadcastService.sendBroadcast(messageContent);
      } else {
        broadcastResult = await this.#broadcastService.sendNarrowcast(
          messageContent,
          targetUserIds
        );
      }

      // Update batch with LINE broadcast ID and mark as completed
      const completedBatch = sendingBatch
        .setLineBroadcastId(broadcastResult.broadcastId)
        .markAsCompleted(
          broadcastResult.sentCount,
          targetUserIds.length - broadcastResult.sentCount
        );

      await this.#batchRepository.save(completedBatch);

      // Mark campaign as sent
      const sentCampaign = sendingCampaign.markAsSent(
        broadcastResult.sentCount,
        targetUserIds.length - broadcastResult.sentCount
      );
      await this.#campaignRepository.save(sentCampaign);

      return {
        id: sentCampaign.id,
        name: sentCampaign.name,
        status: sentCampaign.status,
        batchId: completedBatch.id,
        targetCount: targetUserIds.length,
        sentAt: sentCampaign.sentAt!,
      };
    } catch (error) {
      // Mark campaign as failed if something went wrong
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const failedCampaign = sendingCampaign.markAsFailed(errorMessage);
      await this.#campaignRepository.save(failedCampaign);

      throw error;
    }
  }

  private prepareMessageContent(campaign: any): any {
    // Apply placeholder data if available
    let content = campaign.content;

    if (campaign.placeholderData && !campaign.placeholderData.isEmpty() && content.text) {
      const renderedText = campaign.placeholderData.applyToTemplate(content.text);
      content = { ...content, text: renderedText };
    }

    // Convert to LINE API format
    return content.toLineMessageObject();
  }
}
