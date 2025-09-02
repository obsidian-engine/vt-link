export type RichMenuSize = 'full' | 'half';

export interface RichMenuArea {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly action: {
    readonly type: 'message' | 'uri' | 'postback';
    readonly text?: string;
    readonly uri?: string;
    readonly data?: string;
    readonly displayText?: string;
  };
}

export class RichMenu {
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_CHAT_BAR_TEXT_LENGTH = 14;
  static readonly MAX_AREAS_COUNT = 20;
  
  // RichMenu dimensions  
  static readonly FULL_WIDTH = 2500;
  static readonly FULL_HEIGHT = 1686;
  static readonly HALF_HEIGHT = 843;

  readonly #id: string;
  readonly #accountId: string;
  readonly #lineRichMenuId: string | null;
  readonly #name: string;
  readonly #size: RichMenuSize;
  readonly #chatBarText: string | null;
  readonly #areas: ReadonlyArray<RichMenuArea>;
  readonly #imageUrl: string | null;
  readonly #isDefault: boolean;
  readonly #isPublished: boolean;

  private constructor(
    id: string,
    accountId: string,
    lineRichMenuId: string | null,
    name: string,
    size: RichMenuSize,
    chatBarText: string | null,
    areas: ReadonlyArray<RichMenuArea>,
    imageUrl: string | null,
    isDefault: boolean,
    isPublished: boolean
  ) {
    if (name.length === 0 || name.length > RichMenu.MAX_NAME_LENGTH) {
      throw new Error('Name must be between 1 and 100 characters');
    }
    
    if (chatBarText && chatBarText.length > RichMenu.MAX_CHAT_BAR_TEXT_LENGTH) {
      throw new Error('Chat bar text must be 14 characters or less');
    }
    
    if (areas.length > RichMenu.MAX_AREAS_COUNT) {
      throw new Error('Areas count must be 20 or less');
    }

    this.#id = id;
    this.#accountId = accountId;
    this.#lineRichMenuId = lineRichMenuId;
    this.#name = name;
    this.#size = size;
    this.#chatBarText = chatBarText;
    this.#areas = areas;
    this.#imageUrl = imageUrl;
    this.#isDefault = isDefault;
    this.#isPublished = isPublished;
    
    Object.freeze(this);
  }

  static create(
    id: string,
    accountId: string,
    name: string,
    size: RichMenuSize = 'full',
    chatBarText: string | null = null,
    areas: ReadonlyArray<RichMenuArea> = [],
    imageUrl: string | null = null
  ): RichMenu {
    return new RichMenu(
      id,
      accountId,
      null,
      name,
      size,
      chatBarText,
      areas,
      imageUrl,
      false,
      false
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    lineRichMenuId: string | null,
    name: string,
    size: RichMenuSize,
    chatBarText: string | null,
    areas: ReadonlyArray<RichMenuArea>,
    imageUrl: string | null,
    isDefault: boolean,
    isPublished: boolean
  ): RichMenu {
    return new RichMenu(
      id,
      accountId,
      lineRichMenuId,
      name,
      size,
      chatBarText,
      areas,
      imageUrl,
      isDefault,
      isPublished
    );
  }

  get id(): string { return this.#id; }
  get accountId(): string { return this.#accountId; }
  get lineRichMenuId(): string | null { return this.#lineRichMenuId; }
  get name(): string { return this.#name; }
  get size(): RichMenuSize { return this.#size; }
  get chatBarText(): string | null { return this.#chatBarText; }
  get areas(): ReadonlyArray<RichMenuArea> { return this.#areas; }
  get imageUrl(): string | null { return this.#imageUrl; }
  get isDefault(): boolean { return this.#isDefault; }
  get isPublished(): boolean { return this.#isPublished; }

  getExpectedWidth(): number {
    return RichMenu.FULL_WIDTH;
  }

  getExpectedHeight(): number {
    return this.#size === 'full' ? RichMenu.FULL_HEIGHT : RichMenu.HALF_HEIGHT;
  }

  isValidAreaBounds(area: RichMenuArea): boolean {
    const maxWidth = this.getExpectedWidth();
    const maxHeight = this.getExpectedHeight();
    
    return (
      area.x >= 0 &&
      area.y >= 0 &&
      area.width > 0 &&
      area.height > 0 &&
      area.x + area.width <= maxWidth &&
      area.y + area.height <= maxHeight
    );
  }

  updateName(name: string): RichMenu {
    return RichMenu.reconstruct(
      this.#id,
      this.#accountId,
      this.#lineRichMenuId,
      name,
      this.#size,
      this.#chatBarText,
      this.#areas,
      this.#imageUrl,
      this.#isDefault,
      this.#isPublished
    );
  }

  updateAreas(areas: ReadonlyArray<RichMenuArea>): RichMenu {
    const validAreas = areas.filter(area => this.isValidAreaBounds(area));
    
    return RichMenu.reconstruct(
      this.#id,
      this.#accountId,
      this.#lineRichMenuId,
      this.#name,
      this.#size,
      this.#chatBarText,
      validAreas,
      this.#imageUrl,
      this.#isDefault,
      this.#isPublished
    );
  }

  setAsDefault(): RichMenu {
    return RichMenu.reconstruct(
      this.#id,
      this.#accountId,
      this.#lineRichMenuId,
      this.#name,
      this.#size,
      this.#chatBarText,
      this.#areas,
      this.#imageUrl,
      true,
      this.#isPublished
    );
  }

  publish(lineRichMenuId: string): RichMenu {
    return RichMenu.reconstruct(
      this.#id,
      this.#accountId,
      lineRichMenuId,
      this.#name,
      this.#size,
      this.#chatBarText,
      this.#areas,
      this.#imageUrl,
      this.#isDefault,
      true
    );
  }

  canBePublished(): boolean {
    return this.#areas.length > 0 && this.#imageUrl !== null;
  }
}