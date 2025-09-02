import type { CampaignStatus, CampaignType } from '@/domain/campaign/entities/MessageCampaign';
import type { DeliveryBatchRepository } from '@/domain/campaign/repositories/DeliveryBatchRepository';
import type { DeliveryLogRepository } from '@/domain/campaign/repositories/DeliveryLogRepository';
import type { MessageCampaignRepository } from '@/domain/campaign/repositories/MessageCampaignRepository';

export interface ListHistoryInput {
  readonly accountId: string;
  readonly status?: CampaignStatus;
  readonly type?: CampaignType;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export interface CampaignHistoryItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: CampaignType;
  readonly status: CampaignStatus;
  readonly scheduledAt: Date | null;
  readonly sentAt: Date | null;
  readonly sentCount: number;
  readonly failCount: number;
  readonly successRate: number;
  readonly templateId: string | null;
  readonly segmentId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListHistoryOutput {
  readonly campaigns: CampaignHistoryItem[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly statistics: {
    readonly totalCampaigns: number;
    readonly sentCampaigns: number;
    readonly totalSentMessages: number;
    readonly totalFailedMessages: number;
    readonly averageSuccessRate: number;
  };
}

export class ListHistoryUsecase {
  readonly #campaignRepository: MessageCampaignRepository;
  readonly #batchRepository: DeliveryBatchRepository;
  readonly #logRepository: DeliveryLogRepository;

  constructor(
    campaignRepository: MessageCampaignRepository,
    batchRepository: DeliveryBatchRepository,
    logRepository: DeliveryLogRepository
  ) {
    this.#campaignRepository = campaignRepository;
    this.#batchRepository = batchRepository;
    this.#logRepository = logRepository;
  }

  async execute(input: ListHistoryInput): Promise<ListHistoryOutput> {
    // Input validation
    if (!input.accountId || input.accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }

    const limit = input.limit || 20;
    const offset = input.offset || 0;

    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    // Validate date range
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new Error('Start date must be before end date');
    }

    // Get campaigns based on filters
    let campaigns;

    if (input.status) {
      campaigns = await this.#campaignRepository.findByAccountIdAndStatus(
        input.accountId,
        input.status
      );
    } else if (input.type) {
      campaigns = await this.#campaignRepository.findByAccountIdAndType(
        input.accountId,
        input.type
      );
    } else if (input.startDate && input.endDate) {
      campaigns = await this.#campaignRepository.findByCreatedDateRange(
        input.accountId,
        input.startDate,
        input.endDate
      );
    } else {
      campaigns = await this.#campaignRepository.findByAccountId(input.accountId);
    }

    // Apply additional filters if needed
    let filteredCampaigns = campaigns;

    if (input.startDate && input.endDate && !input.status && !input.type) {
      // Already filtered by date range
    } else if (input.startDate || input.endDate) {
      filteredCampaigns = campaigns.filter((campaign) => {
        const createdAt = campaign.createdAt;
        if (input.startDate && createdAt < input.startDate) return false;
        if (input.endDate && createdAt > input.endDate) return false;
        return true;
      });
    }

    // Sort by creation date (newest first)
    filteredCampaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = filteredCampaigns.length;
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Convert to history items
    const campaignHistoryItems: CampaignHistoryItem[] = paginatedCampaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      scheduledAt: campaign.scheduledAt,
      sentAt: campaign.sentAt,
      sentCount: campaign.sentCount,
      failCount: campaign.failCount,
      successRate: campaign.getSuccessRate(),
      templateId: campaign.templateId,
      segmentId: campaign.segmentId,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    }));

    // Get account statistics
    const statistics = await this.#campaignRepository.getAccountStatistics(input.accountId);

    return {
      campaigns: campaignHistoryItems,
      total,
      hasMore,
      statistics,
    };
  }
}
