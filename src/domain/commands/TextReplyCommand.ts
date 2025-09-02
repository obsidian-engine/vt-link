import { ReplyCommand, MessageContext } from './ReplyCommand';

/**
 * テキスト返信コマンド
 */
export class TextReplyCommand implements ReplyCommand {
  readonly #text: string;
  readonly #probability: number;

  constructor(text: string, probability: number = 1.0) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    if (probability < 0 || probability > 1) {
      throw new Error('Probability must be between 0 and 1');
    }
    
    this.#text = text;
    this.#probability = probability;
  }

  async execute(context: MessageContext): Promise<void> {
    // 確率による実行判定
    if (!this.shouldExecute()) {
      return;
    }

    // TODO: ここで実際のLINE API呼び出しを行う
    // 現時点では実装としてコンソール出力で代用
    console.log(`Sending text reply to ${context.userId}: ${this.#text}`);
    
    // 実際の実装では以下のような処理になる:
    // await this.lineApiClient.replyMessage(context.replyToken, {
    //   type: 'text',
    //   text: this.#text
    // });
  }

  private shouldExecute(): boolean {
    return Math.random() < this.#probability;
  }

  get text(): string {
    return this.#text;
  }

  get probability(): number {
    return this.#probability;
  }
}