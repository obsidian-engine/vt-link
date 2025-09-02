import type { ReplyCommand, MessageContext } from "./ReplyCommand";

/**
 * 画像返信コマンド
 */
export class ImageReplyCommand implements ReplyCommand {
  readonly #originalContentUrl: string;
  readonly #previewImageUrl: string;
  readonly #probability: number;

  constructor(
    originalContentUrl: string,
    previewImageUrl: string,
    probability: number = 1.0,
  ) {
    if (!originalContentUrl || originalContentUrl.trim().length === 0) {
      throw new Error("Original content URL cannot be empty");
    }
    if (!previewImageUrl || previewImageUrl.trim().length === 0) {
      throw new Error("Preview image URL cannot be empty");
    }
    if (probability < 0 || probability > 1) {
      throw new Error("Probability must be between 0 and 1");
    }

    this.#originalContentUrl = originalContentUrl;
    this.#previewImageUrl = previewImageUrl;
    this.#probability = probability;
  }

  async execute(context: MessageContext): Promise<void> {
    // 確率による実行判定
    if (!this.shouldExecute()) {
      return;
    }

    // TODO: ここで実際のLINE API呼び出しを行う
    console.log(
      `Sending image reply to ${context.userId}: ${this.#originalContentUrl}`,
    );

    // 実際の実装では以下のような処理になる:
    // await this.lineApiClient.replyMessage(context.replyToken, {
    //   type: 'image',
    //   originalContentUrl: this.#originalContentUrl,
    //   previewImageUrl: this.#previewImageUrl
    // });
  }

  private shouldExecute(): boolean {
    return Math.random() < this.#probability;
  }

  get originalContentUrl(): string {
    return this.#originalContentUrl;
  }

  get previewImageUrl(): string {
    return this.#previewImageUrl;
  }

  get probability(): number {
    return this.#probability;
  }
}
