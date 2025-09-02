import type { MessageSpecification } from "./MessageSpecification";
import { IncomingMessage } from "../entities/IncomingMessage";
import { KeywordMatchMode } from "../entities/Condition";

/**
 * キーワードマッチング条件のSpecification
 */
export class KeywordSpecification implements MessageSpecification {
  readonly #keyword: string;
  readonly #mode: KeywordMatchMode;
  readonly #caseSensitive: boolean;

  constructor(
    keyword: string,
    mode: KeywordMatchMode = KeywordMatchMode.Partial,
    caseSensitive: boolean = false,
  ) {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error("Keyword cannot be empty");
    }

    this.#keyword = keyword;
    this.#mode = mode;
    this.#caseSensitive = caseSensitive;
  }

  isSatisfiedBy(message: IncomingMessage): boolean {
    if (message.type !== "text") {
      return false;
    }

    if (!message.text) {
      return false; // null or empty text cannot match keywords
    }

    const messageText = this.#caseSensitive
      ? message.text
      : message.text.toLowerCase();

    const keyword = this.#caseSensitive
      ? this.#keyword
      : this.#keyword.toLowerCase();

    switch (this.#mode) {
      case KeywordMatchMode.Exact:
        return messageText === keyword;
      case KeywordMatchMode.StartsWith:
        return messageText?.startsWith(keyword) ?? false;
      case KeywordMatchMode.EndsWith:
        return messageText?.endsWith(keyword) ?? false;
      case KeywordMatchMode.Partial:
      default:
        return messageText?.includes(keyword) ?? false;
    }
  }

  get keyword(): string {
    return this.#keyword;
  }

  get mode(): KeywordMatchMode {
    return this.#mode;
  }

  get caseSensitive(): boolean {
    return this.#caseSensitive;
  }
}
