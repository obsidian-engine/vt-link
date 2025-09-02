import type { IncomingMessage, MessageType } from '../entities/IncomingMessage';
import type { MessageSpecification } from './MessageSpecification';

/**
 * メッセージタイプ条件のSpecification
 */
export class MessageTypeSpecification implements MessageSpecification {
  readonly #allowedTypes: Set<MessageType>;

  constructor(allowedTypes: MessageType[]) {
    if (!allowedTypes || allowedTypes.length === 0) {
      throw new Error('At least one message type must be specified');
    }

    this.#allowedTypes = new Set(allowedTypes);
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    return this.#allowedTypes.has(message.type);
  }

  get allowedTypes(): MessageType[] {
    return Array.from(this.#allowedTypes);
  }
}
