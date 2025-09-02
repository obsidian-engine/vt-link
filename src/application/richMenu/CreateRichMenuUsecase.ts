import { RichMenu } from '@/domain/entities/RichMenu';
import type { RichMenuArea } from '@/domain/entities/RichMenu';
import type { RichMenuRepository } from '@/domain/repositories/RichMenuRepository';

export interface CreateRichMenuInput {
  readonly accountId: string;
  readonly name: string;
  readonly size: 'full' | 'half';
  readonly chatBarText?: string;
  readonly areas?: ReadonlyArray<RichMenuArea>;
  readonly imageUrl?: string;
}

export interface CreateRichMenuOutput {
  readonly id: string;
  readonly name: string;
  readonly canBePublished: boolean;
}

export class CreateRichMenuUsecase {
  constructor(private readonly richMenuRepository: RichMenuRepository) {}

  async execute(input: CreateRichMenuInput): Promise<CreateRichMenuOutput> {
    const id = crypto.randomUUID();

    const richMenu = RichMenu.create(
      id,
      input.accountId,
      input.name,
      input.size,
      input.chatBarText ?? null,
      input.areas ?? [],
      input.imageUrl ?? null
    );

    await this.richMenuRepository.save(richMenu);

    return {
      id: richMenu.id,
      name: richMenu.name,
      canBePublished: richMenu.canBePublished(),
    };
  }
}
