import { AutoReplyRuleRepository } from '@/domain/repositories/AutoReplyRuleRepository';

export interface GetAutoReplyRulesInput {
  readonly accountId: string;
  readonly includeDisabled?: boolean;
}

export interface AutoReplyRuleDto {
  readonly id: string;
  readonly name: string;
  readonly priority: number;
  readonly conditionsCount: number;
  readonly responsesCount: number;
  readonly hasRateLimit: boolean;
  readonly hasTimeWindow: boolean;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GetAutoReplyRulesOutput {
  readonly rules: ReadonlyArray<AutoReplyRuleDto>;
  readonly totalCount: number;
}

export class GetAutoReplyRulesUsecase {
  constructor(
    private readonly autoReplyRuleRepository: AutoReplyRuleRepository
  ) {}

  async execute(input: GetAutoReplyRulesInput): Promise<GetAutoReplyRulesOutput> {
    const rules = input.includeDisabled
      ? await this.autoReplyRuleRepository.findAllByAccountId(input.accountId)
      : await this.autoReplyRuleRepository.findActiveByAccountId(input.accountId);

    const ruleDtos: AutoReplyRuleDto[] = rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      conditionsCount: rule.conditions.length,
      responsesCount: rule.responses.length,
      hasRateLimit: rule.rateLimit !== null,
      hasTimeWindow: rule.timeWindow !== null,
      enabled: rule.enabled,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));

    return {
      rules: ruleDtos,
      totalCount: ruleDtos.length,
    };
  }
}