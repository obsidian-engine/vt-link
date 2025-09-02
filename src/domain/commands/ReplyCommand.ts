import type { IncomingMessage } from '../entities/IncomingMessage';

/**
 * メッセージコンテキスト - 返信に必要な情報をカプセル化
 */
export interface MessageContext {
  readonly message: IncomingMessage;
  readonly replyToken: string;
  readonly userId: string;
  readonly groupId?: string;
  readonly roomId?: string;
}

/**
 * 返信コマンドのインターフェース
 * 「何をするか」の責務を担当
 */
export interface ReplyCommand {
  /**
   * 返信アクションを実行する
   */
  execute(context: MessageContext): Promise<void>;
}
