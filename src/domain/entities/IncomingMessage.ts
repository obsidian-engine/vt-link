export enum MessageType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Location = "location",
  Sticker = "sticker",
}

export interface MessageSource {
  readonly type: "user" | "group" | "room";
  readonly userId: string;
  readonly groupId?: string;
  readonly roomId?: string;
}

export class IncomingMessage {
  readonly #id: string;
  readonly #type: MessageType;
  readonly #text: string | null;
  readonly #source: MessageSource;
  readonly #timestamp: Date;
  readonly #replyToken: string;

  private constructor(
    id: string,
    type: MessageType,
    text: string | null,
    source: MessageSource,
    timestamp: Date,
    replyToken: string,
  ) {
    this.#id = id;
    this.#type = type;
    this.#text = text;
    this.#source = source;
    this.#timestamp = timestamp;
    this.#replyToken = replyToken;
    Object.freeze(this);
  }

  static create(
    id: string,
    type: MessageType,
    text: string | null,
    source: MessageSource,
    timestamp: Date,
    replyToken: string,
  ): IncomingMessage {
    if (!id) {
      throw new Error("Message ID is required");
    }
    if (!replyToken) {
      throw new Error("Reply token is required");
    }
    if (!source.userId) {
      throw new Error("User ID is required");
    }

    return new IncomingMessage(id, type, text, source, timestamp, replyToken);
  }

  static fromLineWebhookEvent(event: any): IncomingMessage {
    return IncomingMessage.create(
      event.message?.id || crypto.randomUUID(),
      (event.message?.type as MessageType) || MessageType.Text,
      event.message?.text || null,
      {
        type: event.source.type,
        userId: event.source.userId,
        groupId: event.source.groupId,
        roomId: event.source.roomId,
      },
      new Date(event.timestamp),
      event.replyToken,
    );
  }

  get id(): string {
    return this.#id;
  }

  get type(): MessageType {
    return this.#type;
  }

  get text(): string | null {
    return this.#text;
  }

  get source(): MessageSource {
    return this.#source;
  }

  get timestamp(): Date {
    return this.#timestamp;
  }

  get replyToken(): string {
    return this.#replyToken;
  }

  get userId(): string {
    return this.#source.userId;
  }

  get groupId(): string | null {
    return this.#source.groupId || null;
  }

  get roomId(): string | null {
    return this.#source.roomId || null;
  }

  isTextMessage(): boolean {
    return this.#type === MessageType.Text && this.#text !== null;
  }

  hasText(): boolean {
    return this.#text !== null && this.#text.trim().length > 0;
  }
}
