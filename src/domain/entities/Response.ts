export enum ResponseType {
  Text = "text",
  Image = "image",
  Sticker = "sticker",
}

export interface TextResponsePayload {
  readonly text: string;
}

export interface ImageResponsePayload {
  readonly originalContentUrl: string;
  readonly previewImageUrl: string;
}

export interface StickerResponsePayload {
  readonly packageId: string;
  readonly stickerId: string;
}

export type ResponsePayload =
  | TextResponsePayload
  | ImageResponsePayload
  | StickerResponsePayload;

export class Response {
  readonly #id: string;
  readonly #type: ResponseType;
  readonly #payload: ResponsePayload;
  readonly #probability: number;

  private constructor(
    id: string,
    type: ResponseType,
    payload: ResponsePayload,
    probability: number,
  ) {
    this.#id = id;
    this.#type = type;
    this.#payload = payload;
    this.#probability = probability;
    Object.freeze(this);
  }

  static createText(id: string, text: string, probability = 1.0): Response {
    if (!text || text.trim().length === 0) {
      throw new Error("Text content cannot be empty");
    }
    if (text.length > 5000) {
      throw new Error("Text content cannot exceed 5000 characters");
    }
    if (probability < 0 || probability > 1) {
      throw new Error("Probability must be between 0 and 1");
    }

    return new Response(
      id,
      ResponseType.Text,
      { text: text.trim() },
      probability,
    );
  }

  static createImage(
    id: string,
    originalContentUrl: string,
    previewImageUrl: string,
    probability = 1.0,
  ): Response {
    if (!originalContentUrl || !previewImageUrl) {
      throw new Error("Image URLs are required");
    }
    if (probability < 0 || probability > 1) {
      throw new Error("Probability must be between 0 and 1");
    }

    return new Response(
      id,
      ResponseType.Image,
      { originalContentUrl, previewImageUrl },
      probability,
    );
  }

  static createSticker(
    id: string,
    packageId: string,
    stickerId: string,
    probability = 1.0,
  ): Response {
    if (!packageId || !stickerId) {
      throw new Error("Package ID and Sticker ID are required");
    }
    if (probability < 0 || probability > 1) {
      throw new Error("Probability must be between 0 and 1");
    }

    return new Response(
      id,
      ResponseType.Sticker,
      { packageId, stickerId },
      probability,
    );
  }

  static reconstruct(
    id: string,
    type: ResponseType,
    payload: ResponsePayload,
    probability: number,
  ): Response {
    return new Response(id, type, payload, probability);
  }

  get id(): string {
    return this.#id;
  }

  get type(): ResponseType {
    return this.#type;
  }

  get payload(): ResponsePayload {
    return this.#payload;
  }

  get probability(): number {
    return this.#probability;
  }

  get text(): string | null {
    return this.#type === ResponseType.Text
      ? (this.#payload as TextResponsePayload).text
      : null;
  }

  get originalContentUrl(): string | null {
    return this.#type === ResponseType.Image
      ? (this.#payload as ImageResponsePayload).originalContentUrl
      : null;
  }

  get previewImageUrl(): string | null {
    return this.#type === ResponseType.Image
      ? (this.#payload as ImageResponsePayload).previewImageUrl
      : null;
  }

  get packageId(): string | null {
    return this.#type === ResponseType.Sticker
      ? (this.#payload as StickerResponsePayload).packageId
      : null;
  }

  get stickerId(): string | null {
    return this.#type === ResponseType.Sticker
      ? (this.#payload as StickerResponsePayload).stickerId
      : null;
  }

  shouldExecute(): boolean {
    return Math.random() <= this.#probability;
  }

  toLineMessageObject(): any {
    switch (this.#type) {
      case ResponseType.Text:
        return {
          type: "text",
          text: (this.#payload as TextResponsePayload).text,
        };
      case ResponseType.Image:
        const imagePayload = this.#payload as ImageResponsePayload;
        return {
          type: "image",
          originalContentUrl: imagePayload.originalContentUrl,
          previewImageUrl: imagePayload.previewImageUrl,
        };
      case ResponseType.Sticker:
        const stickerPayload = this.#payload as StickerResponsePayload;
        return {
          type: "sticker",
          packageId: stickerPayload.packageId,
          stickerId: stickerPayload.stickerId,
        };
      default:
        throw new Error(`Unsupported response type: ${this.#type}`);
    }
  }

  toJSON(): any {
    return {
      type: this.#type,
      payload: this.#payload,
      probability: this.#probability,
    };
  }

  static fromJSON(data: any): Response {
    const id = crypto.randomUUID();

    switch (data.type) {
      case ResponseType.Text:
        return Response.createText(id, data.payload.text, data.probability);

      case ResponseType.Image:
        return Response.createImage(
          id,
          data.payload.originalContentUrl,
          data.payload.previewImageUrl,
          data.probability,
        );

      case ResponseType.Sticker:
        return Response.createSticker(
          id,
          data.payload.packageId,
          data.payload.stickerId,
          data.probability,
        );

      default:
        throw new Error(`Unsupported response type: ${data.type}`);
    }
  }
}
