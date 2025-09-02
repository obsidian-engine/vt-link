/**
 * バッチ実行UseCase
 * 配信バッチの実行を担当
 */

export interface ExecuteBatchInput {
  batchId: string;
}

export interface ExecuteBatchOutput {
  batchId: string;
  processedCount: number;
  sentCount: number;
  failedCount: number;
  status: "completed" | "failed" | "partial";
}

/**
 * バッチ実行UseCase実装
 * TODO: 実装を完了させる
 */
export class ExecuteBatchUsecase {
  async execute(input: ExecuteBatchInput): Promise<ExecuteBatchOutput> {
    // TODO: 実装
    throw new Error("ExecuteBatchUsecase: Method not implemented");
  }
}

export const executeBatchUsecase = new ExecuteBatchUsecase();
