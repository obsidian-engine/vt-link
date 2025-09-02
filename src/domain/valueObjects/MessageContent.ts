export enum MessageType {
  Text = 'text',
  Image = 'image',
  Sticker = 'sticker',
}

export interface TextContent {
  readonly text: string;
}

export interface ImageContent {
  readonly originalContentUrl: string;
  readonly previewImageUrl: string;
}

export interface StickerContent {
  readonly packageId: string;
  readonly stickerId: string;
}

export type MessagePayload = TextContent | ImageContent | StickerContent;

export class MessageContent {
  readonly #type: MessageType;
  readonly #payload: MessagePayload;

  private constructor(type: MessageType, payload: MessagePayload) {
    this.#type = type;
    this.#payload = payload;
    Object.freeze(this);
  }

  static createText(text: string): MessageContent {
    if (!text || text.trim().length === 0) {
      throw new Error('Text content cannot be empty');
    }
    if (text.length > 5000) {
      throw new Error('Text content cannot exceed 5000 characters');
    }

    const payload: TextContent = { text: text.trim() };
    return new MessageContent(MessageType.Text, payload);
  }

  static createImage(originalContentUrl: string, previewImageUrl?: string): MessageContent {
    if (!originalContentUrl || originalContentUrl.trim().length === 0) {
      throw new Error('Original content URL is required');
    }
    if (!this.isValidUrl(originalContentUrl)) {
      throw new Error('Invalid original content URL');
    }

    const preview = previewImageUrl || originalContentUrl;
    if (!this.isValidUrl(preview)) {
      throw new Error('Invalid preview image URL');
    }

    const payload: ImageContent = {
      originalContentUrl: originalContentUrl.trim(),
      previewImageUrl: preview.trim(),
    };
    return new MessageContent(MessageType.Image, payload);
  }

  static createSticker(packageId: string, stickerId: string): MessageContent {
    if (!packageId || packageId.trim().length === 0) {
      throw new Error('Package ID is required');
    }
    if (!stickerId || stickerId.trim().length === 0) {
      throw new Error('Sticker ID is required');
    }

    const payload: StickerContent = {
      packageId: packageId.trim(),
      stickerId: stickerId.trim(),
    };
    return new MessageContent(MessageType.Sticker, payload);
  }

  static reconstruct(type: MessageType, payload: MessagePayload): MessageContent {
    return new MessageContent(type, payload);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  get type(): MessageType {
    return this.#type;
  }

  get payload(): MessagePayload {
    return this.#payload;
  }

  get text(): string | null {
    return this.#type === MessageType.Text ? (this.#payload as TextContent).text : null;
  }

  get originalContentUrl(): string | null {
    return this.#type === MessageType.Image ? (this.#payload as ImageContent).originalContentUrl : null;
  }

  get previewImageUrl(): string | null {
    return this.#type === MessageType.Image ? (this.#payload as ImageContent).previewImageUrl : null;
  }

  get packageId(): string | null {
    return this.#type === MessageType.Sticker ? (this.#payload as StickerContent).packageId : null;
  }

  get stickerId(): string | null {
    return this.#type === MessageType.Sticker ? (this.#payload as StickerContent).stickerId : null;
  }

  equals(other: MessageContent): boolean {
    if (this.#type !== other.#type) {
      return false;
    }

    switch (this.#type) {
      case MessageType.Text:
        return (this.#payload as TextContent).text === (other.#payload as TextContent).text;
      case MessageType.Image:
        const thisImage = this.#payload as ImageContent;
        const otherImage = other.#payload as ImageContent;
        return thisImage.originalContentUrl === otherImage.originalContentUrl &&
               thisImage.previewImageUrl === otherImage.previewImageUrl;
      case MessageType.Sticker:
        const thisSticker = this.#payload as StickerContent;
        const otherSticker = other.#payload as StickerContent;
        return thisSticker.packageId === otherSticker.packageId &&
               thisSticker.stickerId === otherSticker.stickerId;
      default:
        return false;
    }
  }

  toLineMessageObject(): any {
    switch (this.#type) {
      case MessageType.Text:
        return {
          type: 'text',
          text: (this.#payload as TextContent).text,
        };
      case MessageType.Image:
        const imagePayload = this.#payload as ImageContent;
        return {
          type: 'image',
          originalContentUrl: imagePayload.originalContentUrl,
          previewImageUrl: imagePayload.previewImageUrl,
        };
      case MessageType.Sticker:
        const stickerPayload = this.#payload as StickerContent;
        return {
          type: 'sticker',
          packageId: stickerPayload.packageId,
          stickerId: stickerPayload.stickerId,
        };
      default:
        throw new Error(`Unsupported message type: ${this.#type}`);
    }
  }

  toJSON(): any {
    return {
      type: this.#type,
      payload: this.#payload,
    };
  }
}