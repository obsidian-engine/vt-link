import { AutoReplyRule, ReplyContent } from '@/domain/entities/AutoReplyRule';
import { AutoReplyRuleRepository } from '@/domain/repositories/AutoReplyRuleRepository';

export interface CreateAutoReplyRuleInput {
  readonly accountId: string;
  readonly name: string;
  readonly keywords: ReadonlyArray<string>;
  readonly replyContent: ReplyContent;
  readonly priority?: number;
}

export interface CreateAutoReplyRuleOutput {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
}

export class CreateAutoReplyRuleUsecase {
  constructor(
    private readonly autoReplyRuleRepository: AutoReplyRuleRepository
  ) {}

  async execute(input: CreateAutoReplyRuleInput): Promise<CreateAutoReplyRuleOutput> {
    const id = crypto.randomUUID();
    
    const rule = AutoReplyRule.create(
      id,
      input.accountId,
      input.name,
      input.keywords,
      input.replyContent,
      input.priority ?? AutoReplyRule.DEFAULT_PRIORITY
    );

    await this.autoReplyRuleRepository.save(rule);

    return {
      id: rule.id,
      name: rule.name,
      isActive: rule.isActive(),
    };
  }
}