import type { MessageContext, ReplyCommand } from './ReplyCommand';

/**
 * スタンプ返信コマンド
 */
export class StickerReplyCommand implements ReplyCommand {
  readonly #packageId: string;
  readonly #stickerId: string;
  readonly #probability: number;

  constructor(packageId: string, stickerId: string, probability = 1.0) {
    if (!packageId || packageId.trim().length === 0) {
      throw new Error('Package ID cannot be empty');
    }
    if (!stickerId || stickerId.trim().length === 0) {
      throw new Error('Sticker ID cannot be empty');
    }
    if (probability < 0 || probability > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    this.#packageId = packageId;
    this.#stickerId = stickerId;
    this.#probability = probability;
  }

  async execute(context: MessageContext): Promise<void> {
    // 確率による実行判定
    if (!this.shouldExecute()) {
      return;
    }

    // TODO: ここで実際のLINE API呼び出しを行う
    console.log(
      `Sending sticker reply to ${context.userId}: ${this.#packageId}/${this.#stickerId}`
    );

    // 実際の実装では以下のような処理になる:
    // await this.lineApiClient.replyMessage(context.replyToken, {
    //   type: 'sticker',
    //   packageId: this.#packageId,
    //   stickerId: this.#stickerId
    // });
  }

  private shouldExecute(): boolean {
    return Math.random() < this.#probability;
  }

  get packageId(): string {
    return this.#packageId;
  }

  get stickerId(): string {
    return this.#stickerId;
  }

  get probability(): number {
    return this.#probability;
  }
}
