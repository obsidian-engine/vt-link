import { AutoReplyRule } from '@/domain/entities/AutoReplyRule';
import { 
  Condition, 
  KeywordCondition, 
  RegexCondition, 
  MessageTypeCondition,
  TimeCondition,
  UserCondition,
  ConditionType,
  KeywordMatchMode
} from '@/domain/entities/Condition';
import { Response, ResponseType } from '@/domain/entities/Response';
import { RateLimit, RateLimitScope } from '@/domain/entities/RateLimit';
import { TimeWindow } from '@/domain/entities/TimeWindow';
import { MessageType } from '@/domain/entities/IncomingMessage';
import { AutoReplyRuleRepository } from '@/domain/repositories/AutoReplyRuleRepository';

interface ConditionInputData {
  readonly type: ConditionType;
  readonly keyword?: string;
  readonly mode?: KeywordMatchMode;
  readonly caseSensitive?: boolean;
  readonly pattern?: string;
  readonly flags?: string;
  readonly allowedTypes?: MessageType[];
  readonly startTime?: string;
  readonly endTime?: string;
  readonly timeZone?: string;
  readonly targetUsers?: string[];
  readonly includeMode?: boolean;
}

interface ResponseInputData {
  readonly type: ResponseType;
  readonly text?: string;
  readonly originalContentUrl?: string;
  readonly previewImageUrl?: string;
  readonly packageId?: string;
  readonly stickerId?: string;
  readonly probability?: number;
}

export interface CreateAutoReplyRuleInput {
  readonly accountId: string;
  readonly name: string;
  readonly priority?: number;
  readonly conditions: ReadonlyArray<{
    readonly type: ConditionType;
    readonly keyword?: string;
    readonly mode?: KeywordMatchMode;
    readonly caseSensitive?: boolean;
    readonly pattern?: string;
    readonly flags?: string;
    readonly allowedTypes?: MessageType[];
    readonly startTime?: string;
    readonly endTime?: string;
    readonly timeZone?: string;
    readonly targetUsers?: string[];
    readonly includeMode?: boolean;
  }>;
  readonly responses: ReadonlyArray<{
    readonly type: ResponseType;
    readonly text?: string;
    readonly originalContentUrl?: string;
    readonly previewImageUrl?: string;
    readonly packageId?: string;
    readonly stickerId?: string;
    readonly probability?: number;
  }>;
  readonly rateLimit?: {
    readonly scope: RateLimitScope;
    readonly limit: number;
    readonly windowSeconds: number;
  };
  readonly timeWindow?: {
    readonly startTime: string;
    readonly endTime: string;
    readonly timeZone?: string;
    readonly daysOfWeek?: number[];
  };
  readonly enabled?: boolean;
}

export interface CreateAutoReplyRuleOutput {
  readonly id: string;
  readonly name: string;
  readonly priority: number;
  readonly enabled: boolean;
}

export class CreateAutoReplyRuleUsecase {
  constructor(
    private readonly autoReplyRuleRepository: AutoReplyRuleRepository
  ) {}

  async execute(input: CreateAutoReplyRuleInput): Promise<CreateAutoReplyRuleOutput> {
    const id = crypto.randomUUID();
    
    // Get next priority if not specified
    const priority = input.priority ?? await this.getNextPriority(input.accountId);
    
    // Build conditions
    const conditions = input.conditions.map((conditionData, index) => {
      const conditionId = crypto.randomUUID();
      return this.buildCondition(conditionId, conditionData);
    });

    // Build responses
    const responses = input.responses.map((responseData, index) => {
      const responseId = crypto.randomUUID();
      return this.buildResponse(responseId, responseData);
    });

    // Build rate limit
    const rateLimit = input.rateLimit
      ? RateLimit.create(
          input.rateLimit.scope,
          input.rateLimit.limit,
          input.rateLimit.windowSeconds
        )
      : null;

    // Build time window
    const timeWindow = input.timeWindow
      ? TimeWindow.create(
          input.timeWindow.startTime,
          input.timeWindow.endTime,
          input.timeWindow.timeZone,
          input.timeWindow.daysOfWeek
        )
      : null;

    const rule = AutoReplyRule.create(
      id,
      input.accountId,
      input.name,
      priority,
      conditions,
      responses,
      rateLimit,
      timeWindow,
      input.enabled ?? true
    );

    await this.autoReplyRuleRepository.save(rule);

    return {
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      enabled: rule.enabled,
    };
  }

  private async getNextPriority(accountId: string): Promise<number> {
    const existingRules = await this.autoReplyRuleRepository.findAllByAccountId(accountId);
    const maxPriority = existingRules.reduce((max, rule) => 
      Math.max(max, rule.priority), -1
    );
    return maxPriority + 1;
  }

  private buildCondition(id: string, data: ConditionInputData): Condition {
    switch (data.type) {
      case ConditionType.Keyword:
        if (!data.keyword || data.keyword.trim().length === 0) {
          throw new Error('Keyword is required for keyword condition');
        }
        return KeywordCondition.create(
          id,
          data.keyword,
          data.mode ?? KeywordMatchMode.Partial,
          data.caseSensitive ?? false
        );
      
      case ConditionType.Regex:
        if (!data.pattern || data.pattern.trim().length === 0) {
          throw new Error('Pattern is required for regex condition');
        }
        return RegexCondition.create(
          id,
          data.pattern,
          data.flags ?? 'i'
        );
      
      case ConditionType.MessageType:
        if (!data.allowedTypes || data.allowedTypes.length === 0) {
          throw new Error('Allowed types are required for message type condition');
        }
        return MessageTypeCondition.create(
          id,
          data.allowedTypes
        );
      
      case ConditionType.Time:
        if (!data.startTime || !data.endTime) {
          throw new Error('Start time and end time are required for time condition');
        }
        return TimeCondition.create(
          id,
          data.startTime,
          data.endTime,
          data.timeZone ?? 'Asia/Tokyo'
        );
      
      case ConditionType.User:
        if (!data.targetUsers || data.targetUsers.length === 0) {
          throw new Error('Target users are required for user condition');
        }
        return UserCondition.create(
          id,
          data.targetUsers,
          data.includeMode ?? true
        );
      
      default:
        throw new Error(`Unsupported condition type: ${data.type}`);
    }
  }

  private buildResponse(id: string, data: ResponseInputData): Response {
    switch (data.type) {
      case ResponseType.Text:
        if (!data.text || data.text.trim().length === 0) {
          throw new Error('Text is required for text response');
        }
        return Response.createText(
          id,
          data.text,
          data.probability ?? 1.0
        );
      
      case ResponseType.Image:
        if (!data.originalContentUrl || !data.previewImageUrl) {
          throw new Error('Original content URL and preview image URL are required for image response');
        }
        return Response.createImage(
          id,
          data.originalContentUrl,
          data.previewImageUrl,
          data.probability ?? 1.0
        );
      
      case ResponseType.Sticker:
        if (!data.packageId || !data.stickerId) {
          throw new Error('Package ID and sticker ID are required for sticker response');
        }
        return Response.createSticker(
          id,
          data.packageId,
          data.stickerId,
          data.probability ?? 1.0
        );
      
      default:
        throw new Error(`Unsupported response type: ${data.type}`);
    }
  }
}