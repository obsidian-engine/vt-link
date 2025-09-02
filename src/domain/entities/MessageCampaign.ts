export type MessageStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type MessageType = 'broadcast' | 'multicast' | 'push';

export interface MessageContent {
  readonly type: 'text' | 'image' | 'video' | 'sticker';
  readonly text?: string;
  readonly imageUrl?: string;
  readonly videoUrl?: string;
  readonly packageId?: string;
  readonly stickerId?: string;
}

export class MessageCampaign {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_TARGET_USERS = 10000;
  static readonly MAX_CONTENT_ITEMS = 5;

  readonly #id: string;
  readonly #accountId: string;
  readonly #name: string;
  readonly #messageType: MessageType;
  readonly #content: ReadonlyArray<MessageContent>;
  readonly #targetUsers: ReadonlyArray<string>;
  readonly #scheduledAt: Date | null;
  readonly #sentAt: Date | null;
  readonly #status: MessageStatus;
  readonly #errorMessage: string | null;
  readonly #sentCount: number;

  private constructor(
    id: string,
    accountId: string,
    name: string,
    messageType: MessageType,
    content: ReadonlyArray<MessageContent>,
    targetUsers: ReadonlyArray<string>,
    scheduledAt: Date | null,
    sentAt: Date | null,
    status: MessageStatus,
    errorMessage: string | null,
    sentCount: number
  ) {
    if (name.length === 0 || name.length > MessageCampaign.MAX_NAME_LENGTH) {
      throw new Error('Name must be between 1 and 100 characters');
    }
    
    if (content.length === 0 || content.length > MessageCampaign.MAX_CONTENT_ITEMS) {
      throw new Error('Content items must be between 1 and 5');
    }
    
    if (messageType !== 'broadcast' && targetUsers.length === 0) {
      throw new Error('Target users are required for non-broadcast messages');
    }
    
    if (targetUsers.length > MessageCampaign.MAX_TARGET_USERS) {
      throw new Error('Target users must be 500 or less');
    }

    this.#id = id;
    this.#accountId = accountId;
    this.#name = name;
    this.#messageType = messageType;
    this.#content = content;
    this.#targetUsers = targetUsers;
    this.#scheduledAt = scheduledAt;
    this.#sentAt = sentAt;
    this.#status = status;
    this.#errorMessage = errorMessage;
    this.#sentCount = sentCount;
    
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    messageType: MessageType,
    content: ReadonlyArray<MessageContent>,
    targetUsers: ReadonlyArray<string> = []
  ): MessageCampaign {
    return new MessageCampaign(
      id,
      accountId,
      name,
      messageType,
      content,
      targetUsers,
      null,
      null,
      'draft',
      null,
      0
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    name: string,
    messageType: MessageType,
    content: ReadonlyArray<MessageContent>,
    targetUsers: ReadonlyArray<string>,
    scheduledAt: Date | null,
    sentAt: Date | null,
    status: MessageStatus,
    errorMessage: string | null,
    sentCount: number
  ): MessageCampaign {
    return new MessageCampaign(
      id,
      accountId,
      name,
      messageType,
      content,
      targetUsers,
      scheduledAt,
      sentAt,
      status,
      errorMessage,
      sentCount
    );
  }

  get id(): string { return this.#id; }
  get accountId(): string { return this.#accountId; }
  get name(): string { return this.#name; }
  get messageType(): MessageType { return this.#messageType; }
  get content(): ReadonlyArray<MessageContent> { return this.#content; }
  get targetUsers(): ReadonlyArray<string> { return this.#targetUsers; }
  get scheduledAt(): Date | null { return this.#scheduledAt; }
  get sentAt(): Date | null { return this.#sentAt; }
  get status(): MessageStatus { return this.#status; }
  get errorMessage(): string | null { return this.#errorMessage; }
  get sentCount(): number { return this.#sentCount; }

  isDraft(): boolean { return this.#status === 'draft'; }
  isScheduled(): boolean { return this.#status === 'scheduled'; }
  isSent(): boolean { return this.#status === 'sent'; }
  isFailed(): boolean { return this.#status === 'failed'; }

  canBeScheduled(): boolean {
    return this.#status === 'draft' && this.#content.length > 0;
  }

  canBeSent(): boolean {
    return (this.#status === 'draft' || this.#status === 'scheduled') && this.#content.length > 0;
  }

  schedule(scheduledAt: Date): MessageCampaign {
    if (!this.canBeScheduled()) {
      throw new Error('Campaign cannot be scheduled in current state');
    }
    
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    return MessageCampaign.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#messageType,
      this.#content,
      this.#targetUsers,
      scheduledAt,
      this.#sentAt,
      'scheduled',
      this.#errorMessage,
      this.#sentCount
    );
  }

  markAsSending(): MessageCampaign {
    return MessageCampaign.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#messageType,
      this.#content,
      this.#targetUsers,
      this.#scheduledAt,
      this.#sentAt,
      'sending',
      this.#errorMessage,
      this.#sentCount
    );
  }

  markAsSent(sentCount: number): MessageCampaign {
    return MessageCampaign.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#messageType,
      this.#content,
      this.#targetUsers,
      this.#scheduledAt,
      new Date(),
      'sent',
      null,
      sentCount
    );
  }

  markAsFailed(errorMessage: string): MessageCampaign {
    return MessageCampaign.reconstruct(
      this.#id,
      this.#accountId,
      this.#name,
      this.#messageType,
      this.#content,
      this.#targetUsers,
      this.#scheduledAt,
      this.#sentAt,
      'failed',
      errorMessage,
      this.#sentCount
    );
  }
}