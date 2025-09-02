import type { IncomingMessage } from '../entities/IncomingMessage';
import type { MessageSpecification } from './MessageSpecification';

/**
 * 正規表現マッチング条件のSpecification
 */
export class RegexSpecification implements MessageSpecification {
  readonly #pattern: RegExp;

  constructor(pattern: string, flags = 'i') {
    if (!pattern || pattern.trim().length === 0) {
      throw new Error('Regex pattern cannot be empty');
    }

    try {
      this.#pattern = new RegExp(pattern, flags);
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${pattern}`);
    }
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    if (message.type !== 'text') {
      return false;
    }

    if (!message.text) {
      return false; // null text cannot match regex
    }
    return this.#pattern.test(message.text);
  }

  get pattern(): RegExp {
    return this.#pattern;
  }
}
