import type { AutoReplyRule } from '@/domain/entities/AutoReplyRule';
import { IncomingMessage } from '@/domain/entities/IncomingMessage';
import { ReplyLog, ReplyStatus } from '@/domain/entities/ReplyLog';
import { type Response, ResponseType } from '@/domain/entities/Response';
import type {
  ImageResponsePayload,
  StickerResponsePayload,
  TextResponsePayload,
} from '@/domain/entities/Response';
import type { AutoReplyRuleRepository } from '@/domain/repositories/AutoReplyRuleRepository';
import type { ReplyLogRepository } from '@/domain/repositories/ReplyLogRepository';
import type { RateLimiter } from '@/domain/services/RateLimiter';
import type {
  LineImageMessage,
  LineMessageUnion,
  LineStickerMessage,
  LineTextMessage,
  LineWebhookEvent,
} from '@/types/line.types';

export interface LineReplyService {
  reply(replyToken: string, messages: LineMessageUnion[]): Promise<void>;
}

export interface HandleWebhookInput {
  readonly events: ReadonlyArray<LineWebhookEvent>;
  readonly accountId: string;
}

export interface HandleWebhookOutput {
  readonly processedCount: number;
  readonly repliedCount: number;
  readonly errors: ReadonlyArray<string>;
}

export class HandleWebhookUsecase {
  constructor(
    private readonly autoReplyRuleRepository: AutoReplyRuleRepository,
    private readonly replyLogRepository: ReplyLogRepository,
    private readonly rateLimiter: RateLimiter,
    private readonly lineReplyService: LineReplyService
  ) {}

  async execute(input: HandleWebhookInput): Promise<HandleWebhookOutput> {
    const errors: string[] = [];
    let processedCount = 0;
    let repliedCount = 0;

    // Get active rules once for all events
    const activeRules = await this.autoReplyRuleRepository.findActiveByAccountId(input.accountId);

    for (const event of input.events) {
      try {
        if (event.type === 'message') {
          processedCount++;

          const message = IncomingMessage.fromLineWebhookEvent(event);
          const replied = await this.processMessage(message, activeRules, input.accountId);

          if (replied) {
            repliedCount++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Event processing error: ${errorMessage}`);
      }
    }

    return {
      processedCount,
      repliedCount,
      errors,
    };
  }

  private async processMessage(
    message: IncomingMessage,
    rules: AutoReplyRule[],
    accountId: string
  ): Promise<boolean> {
    const startTime = Date.now();

    // Find first matching rule
    for (const rule of rules) {
      if (rule.matches(message)) {
        // Check rate limiting
        const rateLimitKey = rule.getRateLimitKey(message);
        if (rateLimitKey && rule.rateLimit) {
          const rateLimitCheck = await this.rateLimiter.check(rateLimitKey, rule.rateLimit);
          if (!rateLimitCheck.allowed) {
            // Log rate limited attempt
            await this.logReply(
              rule.id,
              accountId,
              message,
              'text',
              'Rate limited',
              ReplyStatus.RateLimited,
              null,
              Date.now() - startTime
            );
            return false;
          }
        }

        // Check time window
        if (!rule.canBeExecuted()) {
          // Log time window blocked attempt
          await this.logReply(
            rule.id,
            accountId,
            message,
            'text',
            'Time window blocked',
            ReplyStatus.TimeWindowBlocked,
            null,
            Date.now() - startTime
          );
          return false;
        }

        // Pick response
        const response = rule.pickResponse();
        if (!response) {
          continue; // No response chosen due to probability
        }

        try {
          // Send reply
          const lineMessage = response.toLineMessageObject();
          await this.lineReplyService.reply(message.replyToken, [lineMessage]);

          // Increment rate limit counter
          if (rateLimitKey && rule.rateLimit) {
            await this.rateLimiter.increment(rateLimitKey, rule.rateLimit);
          }

          // Log successful reply
          await this.logReply(
            rule.id,
            accountId,
            message,
            response.type.toString(),
            this.getResponseContent(this.convertResponseToLineMessage(response)),
            ReplyStatus.Success,
            null,
            Date.now() - startTime
          );

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Log failed reply
          await this.logReply(
            rule.id,
            accountId,
            message,
            response.type.toString(),
            this.getResponseContent(this.convertResponseToLineMessage(response)),
            ReplyStatus.Failed,
            errorMessage,
            Date.now() - startTime
          );

          // Don't try other rules if LINE API fails
          return false;
        }
      }
    }

    return false; // No matching rule found
  }

  private async logReply(
    ruleId: string,
    accountId: string,
    message: IncomingMessage,
    responseType: string,
    responseContent: string,
    status: ReplyStatus,
    error: string | null,
    latencyMs: number
  ): Promise<void> {
    try {
      const log = ReplyLog.create(
        crypto.randomUUID(),
        ruleId,
        accountId,
        message.userId,
        message.groupId,
        message.roomId,
        message.id,
        message.text,
        responseType,
        responseContent,
        status,
        error,
        latencyMs
      );

      // Fire and forget logging to avoid blocking the main flow
      this.replyLogRepository.save(log).catch((logError) => {
        console.error('Failed to save reply log:', logError);
      });
    } catch (logError) {
      console.error('Failed to create reply log:', logError);
    }
  }

  private getResponseContent(response: LineMessageUnion): string {
    switch (response.type) {
      case 'text':
        return response.text || '';
      case 'image':
        return response.originalContentUrl || '';
      case 'sticker':
        return `${response.packageId}:${response.stickerId}`;
      default:
        return response.type;
    }
  }

  private convertResponseToLineMessage(response: Response): LineMessageUnion {
    switch (response.type) {
      case ResponseType.Text:
        const textPayload = response.payload as TextResponsePayload;
        return {
          type: 'text',
          text: textPayload.text,
        } as LineTextMessage;
      case ResponseType.Image:
        const imagePayload = response.payload as ImageResponsePayload;
        return {
          type: 'image',
          originalContentUrl: imagePayload.originalContentUrl,
          previewImageUrl: imagePayload.previewImageUrl,
        } as LineImageMessage;
      case ResponseType.Sticker:
        const stickerPayload = response.payload as StickerResponsePayload;
        return {
          type: 'sticker',
          packageId: stickerPayload.packageId,
          stickerId: stickerPayload.stickerId,
        } as LineStickerMessage;
      default:
        throw new Error(`Unsupported response type: ${response.type}`);
    }
  }
}
