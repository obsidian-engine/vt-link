import { ReplyCommand, MessageContext } from './ReplyCommand';

/**
 * 複数の返信コマンドを組み合わせるCompositeコマンド
 */
export class CompositeReplyCommand implements ReplyCommand {
  readonly #commands: ReplyCommand[];
  readonly #executeAll: boolean;

  constructor(commands: ReplyCommand[], executeAll: boolean = true) {
    if (!commands || commands.length === 0) {
      throw new Error('At least one command must be provided');
    }
    
    this.#commands = [...commands]; // 防御的コピー
    this.#executeAll = executeAll;
  }

  async execute(context: MessageContext): Promise<void> {
    if (this.#executeAll) {
      // すべてのコマンドを順次実行
      for (const command of this.#commands) {
        await command.execute(context);
      }
    } else {
      // ランダムに1つのコマンドを実行
      const randomIndex = Math.floor(Math.random() * this.#commands.length);
      await this.#commands[randomIndex].execute(context);
    }
  }

  /**
   * 新しいコマンドを追加した新しいCompositeコマンドを作成
   */
  addCommand(command: ReplyCommand): CompositeReplyCommand {
    return new CompositeReplyCommand([...this.#commands, command], this.#executeAll);
  }

  get commands(): readonly ReplyCommand[] {
    return this.#commands;
  }

  get executeAll(): boolean {
    return this.#executeAll;
  }
}