import { MessageContent } from '../../valueObjects/MessageContent';
import { PlaceholderData } from '../../valueObjects/PlaceholderData';

export class MessageTemplate {
  static readonly MAX_TITLE_LENGTH = 100;
  static readonly MAX_DESCRIPTION_LENGTH = 500;

  readonly #id: string;
  readonly #accountId: string;
  readonly #title: string;
  readonly #description: string;
  readonly #content: MessageContent;
  readonly #placeholderKeys: ReadonlyArray<string>;
  readonly #isActive: boolean;
  readonly #createdAt: Date;
  readonly #updatedAt: Date;

  private constructor(
    id: string,
    accountId: string,
    title: string,
    description: string,
    content: MessageContent,
    placeholderKeys: ReadonlyArray<string>,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.#id = id;
    this.#accountId = accountId;
    this.#title = title;
    this.#description = description;
    this.#content = content;
    this.#placeholderKeys = placeholderKeys;
    this.#isActive = isActive;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    title: string,
    description: string,
    content: MessageContent
  ): MessageTemplate {
    if (!id || id.trim().length === 0) {
      throw new Error('Template ID is required');
    }
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Template title is required');
    }
    if (title.length > this.MAX_TITLE_LENGTH) {
      throw new Error(`Template title cannot exceed ${this.MAX_TITLE_LENGTH} characters`);
    }
    if (description && description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Template description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }

    // Extract placeholder keys from template content
    const placeholderKeys = content.text 
      ? PlaceholderData.extractPlaceholderKeys(content.text)
      : [];

    const now = new Date();
    return new MessageTemplate(
      id.trim(),
      accountId.trim(),
      title.trim(),
      description?.trim() || '',
      content,
      placeholderKeys,
      true,
      now,
      now
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    title: string,
    description: string,
    content: MessageContent,
    placeholderKeys: ReadonlyArray<string>,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ): MessageTemplate {
    return new MessageTemplate(
      id,
      accountId,
      title,
      description,
      content,
      placeholderKeys,
      isActive,
      createdAt,
      updatedAt
    );
  }

  get id(): string {
    return this.#id;
  }

  get accountId(): string {
    return this.#accountId;
  }

  get title(): string {
    return this.#title;
  }

  get description(): string {
    return this.#description;
  }

  get content(): MessageContent {
    return this.#content;
  }

  get placeholderKeys(): ReadonlyArray<string> {
    return this.#placeholderKeys;
  }

  get isActive(): boolean {
    return this.#isActive;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  /**
   * テンプレートを更新します
   */
  update(
    title?: string,
    description?: string,
    content?: MessageContent
  ): MessageTemplate {
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        throw new Error('Template title is required');
      }
      if (title.length > MessageTemplate.MAX_TITLE_LENGTH) {
        throw new Error(`Template title cannot exceed ${MessageTemplate.MAX_TITLE_LENGTH} characters`);
      }
    }

    if (description !== undefined && description.length > MessageTemplate.MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Template description cannot exceed ${MessageTemplate.MAX_DESCRIPTION_LENGTH} characters`);
    }

    const newTitle = title?.trim() || this.#title;
    const newDescription = description?.trim() || this.#description;
    const newContent = content || this.#content;
    
    // Re-extract placeholder keys if content changed
    const newPlaceholderKeys = content && newContent.text
      ? PlaceholderData.extractPlaceholderKeys(newContent.text)
      : this.#placeholderKeys;

    return new MessageTemplate(
      this.#id,
      this.#accountId,
      newTitle,
      newDescription,
      newContent,
      newPlaceholderKeys,
      this.#isActive,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * テンプレートを無効化します
   */
  deactivate(): MessageTemplate {
    if (!this.#isActive) {
      return this;
    }

    return new MessageTemplate(
      this.#id,
      this.#accountId,
      this.#title,
      this.#description,
      this.#content,
      this.#placeholderKeys,
      false,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * テンプレートを有効化します
   */
  activate(): MessageTemplate {
    if (this.#isActive) {
      return this;
    }

    return new MessageTemplate(
      this.#id,
      this.#accountId,
      this.#title,
      this.#description,
      this.#content,
      this.#placeholderKeys,
      true,
      this.#createdAt,
      new Date()
    );
  }

  /**
   * プレースホルダーデータを適用してメッセージコンテンツを生成します
   */
  renderWithPlaceholders(placeholderData: PlaceholderData): MessageContent {
    if (!this.#content.text) {
      return this.#content;
    }

    const missingKeys = placeholderData.getMissingKeysForTemplate(this.#content.text);
    if (missingKeys.length > 0) {
      throw new Error(`Missing placeholder values for: ${missingKeys.join(', ')}`);
    }

    const renderedText = placeholderData.applyToTemplate(this.#content.text);
    return MessageContent.createText(renderedText);
  }

  /**
   * このテンプレートが指定されたプレースホルダーデータで完全にレンダリング可能かチェックします
   */
  canRenderWith(placeholderData: PlaceholderData): boolean {
    if (!this.#content.text) {
      return true;
    }

    return placeholderData.getMissingKeysForTemplate(this.#content.text).length === 0;
  }

  equals(other: MessageTemplate): boolean {
    return this.#id === other.#id &&
           this.#accountId === other.#accountId;
  }

  toJSON(): any {
    return {
      id: this.#id,
      accountId: this.#accountId,
      title: this.#title,
      description: this.#description,
      content: this.#content.toJSON(),
      placeholderKeys: this.#placeholderKeys,
      isActive: this.#isActive,
      createdAt: this.#createdAt.toISOString(),
      updatedAt: this.#updatedAt.toISOString(),
    };
  }
}