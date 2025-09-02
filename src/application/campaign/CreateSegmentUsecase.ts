/**
 * セグメント作成UseCase
 * ターゲットセグメントの作成を担当
 */

export interface CreateSegmentInput {
  name: string;
  description?: string;
  criteria: {
    demographic?: {
      gender?: string[];
      ageRange?: { min: number; max: number };
      region?: string[];
    };
    behavioral?: {
      lastActiveWithin?: number; // days
      messageFrequency?: 'high' | 'medium' | 'low';
    };
  };
}

export interface CreateSegmentOutput {
  segmentId: string;
  estimatedCount: number;
}

/**
 * セグメント作成UseCase実装
 * TODO: 実装を完了させる
 */
export class CreateSegmentUsecase {
  async execute(input: CreateSegmentInput): Promise<CreateSegmentOutput> {
    // TODO: 実装
    throw new Error('CreateSegmentUsecase: Method not implemented');
  }
}

export const createSegmentUsecase = new CreateSegmentUsecase();
