import { CampaignType, MessageCampaign } from '@/domain/campaign/entities/MessageCampaign';
import type { MessageCampaignRepository } from '@/domain/campaign/repositories/MessageCampaignRepository';
import type { MessageTemplateRepository } from '@/domain/campaign/repositories/MessageTemplateRepository';
import type { TargetSegmentRepository } from '@/domain/campaign/repositories/TargetSegmentRepository';
import { MessageContent } from '@/domain/valueObjects/MessageContent';
import { PlaceholderData } from '@/domain/valueObjects/PlaceholderData';

export interface CreateCampaignInput {
  readonly accountId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: CampaignType;
  readonly templateId?: string;
  readonly segmentId?: string;
  readonly content?: {
    readonly type: 'text' | 'image' | 'sticker';
    readonly text?: string;
    readonly originalContentUrl?: string;
    readonly previewImageUrl?: string;
    readonly packageId?: string;
    readonly stickerId?: string;
  };
  readonly placeholderData?: Record<string, string>;
}

export interface CreateCampaignOutput {
  readonly id: string;
  readonly name: string;
  readonly type: CampaignType;
  readonly status: string;
  readonly createdAt: Date;
}

export class CreateCampaignUsecase {
  readonly #campaignRepository: MessageCampaignRepository;
  readonly #templateRepository: MessageTemplateRepository;
  readonly #segmentRepository: TargetSegmentRepository;

  constructor(
    campaignRepository: MessageCampaignRepository,
    templateRepository: MessageTemplateRepository,
    segmentRepository: TargetSegmentRepository
  ) {
    this.#campaignRepository = campaignRepository;
    this.#templateRepository = templateRepository;
    this.#segmentRepository = segmentRepository;
  }

  async execute(input: CreateCampaignInput): Promise<CreateCampaignOutput> {
    // Input validation
    if (!input.accountId || input.accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Campaign name is required');
    }
    if (!Object.values(CampaignType).includes(input.type)) {
      throw new Error('Invalid campaign type');
    }

    // Generate unique campaign ID
    const campaignId = crypto.randomUUID();

    // Resolve content
    let messageContent: MessageContent;
    let placeholderData = PlaceholderData.createEmpty();

    if (input.templateId) {
      // Use template
      const template = await this.#templateRepository.findById(input.templateId);
      if (!template) {
        throw new Error(`Template not found: ${input.templateId}`);
      }
      if (template.accountId !== input.accountId) {
        throw new Error('Template does not belong to the specified account');
      }
      if (!template.isActive) {
        throw new Error('Template is not active');
      }

      messageContent = template.content;

      // Apply placeholder data if provided
      if (input.placeholderData) {
        placeholderData = PlaceholderData.create(input.placeholderData);

        // Validate that all required placeholders are provided
        if (!template.canRenderWith(placeholderData)) {
          const missingKeys = placeholderData.getMissingKeysForTemplate(
            template.content.text || ''
          );
          throw new Error(`Missing placeholder values: ${missingKeys.join(', ')}`);
        }
      }
    } else if (input.content) {
      // Use direct content
      messageContent = this.createMessageContentFromInput(input.content);

      if (input.placeholderData) {
        placeholderData = PlaceholderData.create(input.placeholderData);
      }
    } else {
      throw new Error('Either templateId or content must be provided');
    }

    // Validate segment if specified
    if (input.segmentId) {
      const segment = await this.#segmentRepository.findById(input.segmentId);
      if (!segment) {
        throw new Error(`Segment not found: ${input.segmentId}`);
      }
      if (segment.accountId !== input.accountId) {
        throw new Error('Segment does not belong to the specified account');
      }
      if (!segment.isActive) {
        throw new Error('Segment is not active');
      }
    }

    // Validate campaign type and segment consistency
    if (input.type === CampaignType.Segment && !input.segmentId) {
      throw new Error('Segment ID is required for segment campaigns');
    }
    if (input.type === CampaignType.Broadcast && input.segmentId) {
      throw new Error('Segment ID should not be specified for broadcast campaigns');
    }

    // Create campaign
    const campaign = MessageCampaign.create(
      campaignId,
      input.accountId,
      input.name,
      input.description || '',
      input.type,
      messageContent,
      input.templateId,
      input.segmentId,
      placeholderData
    );

    // Save campaign
    await this.#campaignRepository.save(campaign);

    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      createdAt: campaign.createdAt,
    };
  }

  private createMessageContentFromInput(
    contentInput: CreateCampaignInput['content']
  ): MessageContent {
    if (!contentInput) {
      throw new Error('Content input is required');
    }

    switch (contentInput.type) {
      case 'text':
        if (!contentInput.text) {
          throw new Error('Text is required for text message');
        }
        return MessageContent.createText(contentInput.text);

      case 'image':
        if (!contentInput.originalContentUrl) {
          throw new Error('Original content URL is required for image message');
        }
        return MessageContent.createImage(
          contentInput.originalContentUrl,
          contentInput.previewImageUrl
        );

      case 'sticker':
        if (!contentInput.packageId || !contentInput.stickerId) {
          throw new Error('Package ID and Sticker ID are required for sticker message');
        }
        return MessageContent.createSticker(contentInput.packageId, contentInput.stickerId);

      default:
        throw new Error(`Unsupported content type: ${contentInput.type}`);
    }
  }
}
