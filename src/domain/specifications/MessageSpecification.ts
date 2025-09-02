import { IncomingMessage } from "../entities/IncomingMessage";

/**
 * メッセージが条件を満たすかを判定するSpecification
 * 「いつ発火するか」の責務を担当
 */
export interface MessageSpecification {
  /**
   * 指定されたメッセージが条件を満たすかを判定
   */
  isSatisfiedBy(message: IncomingMessage): boolean;
}
