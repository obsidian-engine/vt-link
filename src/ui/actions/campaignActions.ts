'use server';

import { CreateCampaignUsecase } from '@/application/campaign/CreateCampaignUsecase';
import { ListHistoryUsecase } from '@/application/campaign/ListHistoryUsecase';
import { SendNowUsecase } from '@/application/campaign/SendNowUsecase';
import type { CampaignType } from '@/domain/campaign/entities/MessageCampaign';
import { LineUserRepositorySupabase } from '@/infrastructure/campaign/repositories/LineUserRepositorySupabase';
import { MessageCampaignRepositorySupabase } from '@/infrastructure/campaign/repositories/MessageCampaignRepositorySupabase';
import { MessageTemplateRepositorySupabase } from '@/infrastructure/campaign/repositories/MessageTemplateRepositorySupabase';
import { TargetSegmentRepositorySupabase } from '@/infrastructure/campaign/repositories/TargetSegmentRepositorySupabase';
import { LineMessagingGateway } from '@/infrastructure/gateways/line/LineMessagingGateway';
import { revalidatePath } from 'next/cache';

export async function createCampaign(formData: FormData) {
  try {
    const accountId = formData.get('accountId') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const campaignType = type === 'broadcast' || type === 'segment' ? type : 'broadcast';
    const templateId = (formData.get('templateId') as string) || undefined;
    const segmentId = (formData.get('segmentId') as string) || undefined;
    const contentJson = formData.get('content') as string;
    const placeholderDataJson = formData.get('placeholderData') as string;
    const scheduledAtStr = formData.get('scheduledAt') as string;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    if (!name) {
      throw new Error('Campaign name is required');
    }

    if (!type) {
      throw new Error('Campaign type is required');
    }

    // コンテンツをパース
    let content;
    if (contentJson) {
      try {
        content = JSON.parse(contentJson);
      } catch (parseError) {
        throw new Error('Invalid content data');
      }
    }

    // プレースホルダーデータをパース
    let placeholderData;
    if (placeholderDataJson) {
      try {
        placeholderData = JSON.parse(placeholderDataJson);
      } catch (parseError) {
        throw new Error('Invalid placeholder data');
      }
    }

    // スケジュール日時をパース
    let scheduledAt;
    if (scheduledAtStr) {
      scheduledAt = new Date(scheduledAtStr);
      if (isNaN(scheduledAt.getTime())) {
        throw new Error('Invalid scheduled date');
      }
    }

    // リポジトリを初期化
    const campaignRepository = new MessageCampaignRepositorySupabase();
    const templateRepository = new MessageTemplateRepositorySupabase();
    const segmentRepository = new TargetSegmentRepositorySupabase();

    const usecase = new CreateCampaignUsecase(
      campaignRepository,
      templateRepository,
      segmentRepository
    );

    const result = await usecase.execute({
      accountId,
      name,
      type: campaignType as CampaignType,
      templateId,
      segmentId,
      content,
      placeholderData,
      scheduledAt,
    });

    revalidatePath('/dashboard/campaigns');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function sendNowCampaign(campaignId: string) {
  try {
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    // リポジトリとゲートウェイを初期化
    const campaignRepository = new MessageCampaignRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();

    const channelAccessToken = process.env['LINE_CHANNEL_ACCESS_TOKEN'];
    if (!channelAccessToken) {
      throw new Error('LINE channel access token is not configured');
    }
    const lineGateway = new LineMessagingGateway(channelAccessToken);

    // スタブ実装（一時的）
    const stubBatchRepository = {
      findByCampaignId: async () => [],
      findByStatus: async () => [],
      findByCampaignIdAndStatus: async () => [],
      findPendingBatches: async () => [],
      save: async () => {},
      updateStatus: async () => {},
      updateResults: async () => {},
      deleteById: async () => {},
      deleteByCampaignId: async () => {},
    };

    const stubSegmentRepository = {
      findById: async () => null,
      findByAccountId: async () => [],
      save: async () => {},
      delete: async () => {},
    };

    const usecase = new SendNowUsecase(
      campaignRepository,
      stubBatchRepository as any, // DeliveryBatchRepository（スタブ実装）
      stubSegmentRepository as any, // TargetSegmentRepository（スタブ実装）
      userRepository,
      lineGateway
    );

    const result = await usecase.execute({
      campaignId,
    });

    revalidatePath('/dashboard/campaigns');
    revalidatePath(`/dashboard/campaigns/${campaignId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getCampaigns(accountId: string) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const repository = new MessageCampaignRepositorySupabase();
    const campaigns = await repository.findByAccountId(accountId);

    return {
      success: true,
      data: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt?.toISOString(),
        sentAt: campaign.sentAt?.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        sentCount: campaign.sentCount,
        failedCount: campaign.failCount,
        estimatedRecipients: 0, // TODO: Claude Aがドメイン層修正後に適切なプロパティに変更
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getCampaignById(campaignId: string) {
  try {
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    const repository = new MessageCampaignRepositorySupabase();
    const campaign = await repository.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return {
      success: true,
      data: {
        id: campaign.id,
        accountId: campaign.accountId,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        content: campaign.content,
        templateId: campaign.templateId,
        segmentId: campaign.segmentId,
        placeholderData: campaign.placeholderData,
        scheduledAt: campaign.scheduledAt?.toISOString(),
        sentAt: campaign.sentAt?.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        sentCount: campaign.sentCount,
        failedCount: campaign.failCount,
        estimatedRecipients: 0, // TODO: Claude Aがドメイン層修正後に適切なプロパティに変更
        errorMessage: null, // TODO: Claude Aがドメイン層修正後に適切なプロパティに変更
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getCampaignHistory(accountId: string, page = 1, limit = 20) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const campaignRepository = new MessageCampaignRepositorySupabase();

    // スタブ実装（一時的）
    const stubBatchRepository = {
      findByCampaignId: async () => [],
      findByStatus: async () => [],
      findByCampaignIdAndStatus: async () => [],
      findPendingBatches: async () => [],
      save: async () => {},
      updateStatus: async () => {},
      updateResults: async () => {},
      deleteById: async () => {},
      deleteByCampaignId: async () => {},
    };

    const stubLogRepository = {
      findByCampaignId: async () => [],
      findByBatchId: async () => [],
      save: async () => {},
      deleteById: async () => {},
      deleteByCampaignId: async () => {},
    };

    const usecase = new ListHistoryUsecase(
      campaignRepository,
      stubBatchRepository as any, // DeliveryBatchRepository（スタブ実装）
      stubLogRepository as any // DeliveryLogRepository（スタブ実装）
    );

    const result = await usecase.execute({
      accountId,
      limit,
    });

    return {
      success: true,
      data: {
        campaigns: result.campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          sentAt: campaign.sentAt?.toISOString(),
          sentCount: campaign.sentCount,
          failedCount: campaign.failCount,
          createdAt: campaign.createdAt.toISOString(),
        })),
        totalCount: result.campaigns.length, // TODO: Claude Aがドメイン層修正後に適切なプロパティに変更
        hasMore: result.hasMore,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    const repository = new MessageCampaignRepositorySupabase();
    const campaign = await repository.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // 送信中または送信済みのキャンペーンは削除できない
    if (campaign.status === 'sending' || campaign.status === 'sent') {
      throw new Error('Cannot delete campaigns that are sending or have been sent');
    }

    await repository.delete(campaignId);

    revalidatePath('/dashboard/campaigns');

    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function duplicateCampaign(campaignId: string) {
  try {
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    const repository = new MessageCampaignRepositorySupabase();
    const originalCampaign = await repository.findById(campaignId);

    if (!originalCampaign) {
      throw new Error('Campaign not found');
    }

    const templateRepository = new MessageTemplateRepositorySupabase();
    const segmentRepository = new TargetSegmentRepositorySupabase();

    const usecase = new CreateCampaignUsecase(repository, templateRepository, segmentRepository);

    const result = await usecase.execute({
      accountId: originalCampaign.accountId,
      name: `${originalCampaign.name} (コピー)`,
      type: originalCampaign.type,
      templateId: originalCampaign.templateId || undefined,
      segmentId: originalCampaign.segmentId || undefined,
      content: originalCampaign.content,
      placeholderData: originalCampaign.placeholderData?.toRecord(),
      // スケジュールは複製しない
    });

    revalidatePath('/dashboard/campaigns');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}
