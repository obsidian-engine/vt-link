/**
 * テンプレート作成UseCase
 * メッセージテンプレートの作成を担当
 */

export interface CreateTemplateInput {
  name: string;
  category: string;
  content: {
    type: 'text' | 'image' | 'sticker';
    text?: string;
    originalContentUrl?: string;
    previewImageUrl?: string;
    packageId?: string;
    stickerId?: string;
  };
  placeholderKeys?: string[];
  description?: string;
}

export interface CreateTemplateOutput {
  templateId: string;
  name: string;
  category: string;
  createdAt: string;
}

/**
 * テンプレート作成UseCase実装
 * TODO: 実装を完了させる
 */
export class CreateTemplateUsecase {
  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    // TODO: 実装
    throw new Error('CreateTemplateUsecase: Method not implemented');
  }
}

export const createTemplateUsecase = new CreateTemplateUsecase();
