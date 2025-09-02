export type ReplyRuleStatus = 'active' | 'inactive';

export interface ReplyContent {
  readonly type: 'text' | 'image' | 'sticker';
  readonly text?: string;
  readonly imageUrl?: string;
  readonly packageId?: string;
  readonly stickerId?: string;
}

export class AutoReplyRule {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_KEYWORDS_COUNT = 20;
  static readonly MAX_KEYWORD_LENGTH = 50;
  static readonly DEFAULT_PRIORITY = 0;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #keywords: ReadonlyArray<string>;
  readonly #replyContent: ReplyContent;
  readonly #priority: number;
  readonly #status: ReplyRuleStatus;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    keywords: ReadonlyArray<string>,
    replyContent: ReplyContent,
    priority: number,
    status: ReplyRuleStatus
  ) {
    if (name.length === 0 || name.length > AutoReplyRule.MAX_NAME_LENGTH) {
      throw new Error('Name must be between 1 and 100 characters');
    }
    
    if (keywords.length === 0 || keywords.length > AutoReplyRule.MAX_KEYWORDS_COUNT) {
      throw new Error('Keywords count must be between 1 and 20');
    }
    
    const invalidKeyword = keywords.find(k => k.length === 0 || k.length > AutoReplyRule.MAX_KEYWORD_LENGTH);
    if (invalidKeyword !== undefined) {
      throw new Error('Each keyword must be between 1 and 50 characters');
    }

    if (replyContent.type === 'text' && (!replyContent.text || replyContent.text.length === 0)) {
      throw new Error('Text reply content cannot be empty');
    }

    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#keywords = keywords;
    this.#replyContent = replyContent;
    this.#priority = priority;
    this.#status = status;
    
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    keywords: ReadonlyArray<string>,
    replyContent: ReplyContent,
    priority: number = AutoReplyRule.DEFAULT_PRIORITY
  ): AutoReplyRule {
    return new AutoReplyRule(
      id,
      accountId,
      name,
      keywords,
      replyContent,
      priority,
      'active'
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    keywords: ReadonlyArray<string>,
    replyContent: ReplyContent,
    priority: number,
    status: ReplyRuleStatus
  ): AutoReplyRule {
    return new AutoReplyRule(
      id,
      accountId,
      name,
      keywords,
      replyContent,
      priority,
      status
    );
  }

  get id(): string { return this.#id; }
  get accountId(): string { return this.#accountId; }
  get name(): string { return this.#name; }
  get keywords(): ReadonlyArray<string> { return this.#keywords; }
  get replyContent(): ReplyContent { return this.#replyContent; }
  get priority(): number { return this.#priority; }
  get status(): ReplyRuleStatus { return this.#status; }

  isActive(): boolean {
    return this.#status === 'active';
  }

  matchesKeyword(message: string): boolean {
    if (!this.isActive()) return false;
    
    const normalizedMessage = message.toLowerCase().trim();
    return this.#keywords.some(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    );
  }

  updateName(name: string): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      name,
      this.#keywords,
      this.#replyContent,
      this.#priority,
      this.#status
    );
  }

  updateKeywords(keywords: ReadonlyArray<string>): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      keywords,
      this.#replyContent,
      this.#priority,
      this.#status
    );
  }

  updateReplyContent(replyContent: ReplyContent): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#keywords,
      replyContent,
      this.#priority,
      this.#status
    );
  }

  activate(): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#keywords,
      this.#replyContent,
      this.#priority,
      'active'
    );
  }

  deactivate(): AutoReplyRule {
    return AutoReplyRule.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#keywords,
      this.#replyContent,
      this.#priority,
      'inactive'
    );
  }
}