import { IncomingMessage, MessageType } from "./IncomingMessage";

export enum ConditionType {
  Keyword = "keyword",
  Regex = "regex",
  MessageType = "messageType",
  Time = "time",
  User = "user",
}

export enum KeywordMatchMode {
  Partial = "partial",
  Exact = "exact",
  StartsWith = "startsWith",
  EndsWith = "endsWith",
}

export abstract class Condition {
  readonly #id: string;
  readonly #type: ConditionType;

  protected constructor(id: string, type: ConditionType) {
    this.#id = id;
    this.#type = type;
  }

  get id(): string {
    return this.#id;
  }

  get type(): ConditionType {
    return this.#type;
  }

  abstract matches(message: IncomingMessage): boolean;
  abstract toJSON(): any;
}

export class KeywordCondition extends Condition {
  readonly #keyword: string;
  readonly #mode: KeywordMatchMode;
  readonly #caseSensitive: boolean;

  private constructor(
    id: string,
    keyword: string,
    mode: KeywordMatchMode,
    caseSensitive: boolean,
  ) {
    super(id, ConditionType.Keyword);
    this.#keyword = keyword;
    this.#mode = mode;
    this.#caseSensitive = caseSensitive;
    Object.freeze(this);
  }

  static create(
    id: string,
    keyword: string,
    mode: KeywordMatchMode = KeywordMatchMode.Partial,
    caseSensitive = false,
  ): KeywordCondition {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error("Keyword cannot be empty");
    }

    return new KeywordCondition(id, keyword.trim(), mode, caseSensitive);
  }

  static reconstruct(
    id: string,
    keyword: string,
    mode: KeywordMatchMode,
    caseSensitive: boolean,
  ): KeywordCondition {
    return new KeywordCondition(id, keyword, mode, caseSensitive);
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

  matches(message: IncomingMessage): boolean {
    if (!message.hasText()) {
      return false;
    }

    const messageText = this.#caseSensitive
      ? message.text!
      : message.text!.toLowerCase();
    const keyword = this.#caseSensitive
      ? this.#keyword
      : this.#keyword.toLowerCase();

    switch (this.#mode) {
      case KeywordMatchMode.Exact:
        return messageText === keyword;
      case KeywordMatchMode.Partial:
        return messageText.includes(keyword);
      case KeywordMatchMode.StartsWith:
        return messageText.startsWith(keyword);
      case KeywordMatchMode.EndsWith:
        return messageText.endsWith(keyword);
      default:
        return false;
    }
  }

  toJSON(): any {
    return {
      type: this.type,
      keyword: this.#keyword,
      mode: this.#mode,
      caseSensitive: this.#caseSensitive,
    };
  }
}

export class RegexCondition extends Condition {
  readonly #pattern: string;
  readonly #flags: string;
  readonly #compiledRegex: RegExp;

  private constructor(id: string, pattern: string, flags: string) {
    super(id, ConditionType.Regex);
    this.#pattern = pattern;
    this.#flags = flags;
    this.#compiledRegex = new RegExp(pattern, flags);
    Object.freeze(this);
  }

  static create(id: string, pattern: string, flags = "i"): RegexCondition {
    if (!pattern || pattern.trim().length === 0) {
      throw new Error("Regex pattern cannot be empty");
    }

    try {
      new RegExp(pattern, flags);
    } catch (error) {
      throw new Error(
        `Invalid regex pattern: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return new RegexCondition(id, pattern.trim(), flags);
  }

  static reconstruct(
    id: string,
    pattern: string,
    flags: string,
  ): RegexCondition {
    return new RegexCondition(id, pattern, flags);
  }

  get pattern(): string {
    return this.#pattern;
  }

  get flags(): string {
    return this.#flags;
  }

  matches(message: IncomingMessage): boolean {
    if (!message.hasText()) {
      return false;
    }

    return this.#compiledRegex.test(message.text!);
  }

  toJSON(): any {
    return {
      type: this.type,
      pattern: this.#pattern,
      flags: this.#flags,
    };
  }
}

export class MessageTypeCondition extends Condition {
  readonly #allowedTypes: Set<MessageType>;

  private constructor(id: string, allowedTypes: MessageType[]) {
    super(id, ConditionType.MessageType);
    this.#allowedTypes = new Set(allowedTypes);
    Object.freeze(this);
  }

  static create(id: string, allowedTypes: MessageType[]): MessageTypeCondition {
    if (!allowedTypes || allowedTypes.length === 0) {
      throw new Error("At least one message type must be specified");
    }

    return new MessageTypeCondition(id, allowedTypes);
  }

  static reconstruct(
    id: string,
    allowedTypes: MessageType[],
  ): MessageTypeCondition {
    return new MessageTypeCondition(id, allowedTypes);
  }

  get allowedTypes(): MessageType[] {
    return Array.from(this.#allowedTypes);
  }

  matches(message: IncomingMessage): boolean {
    return this.#allowedTypes.has(message.type);
  }

  toJSON(): any {
    return {
      type: this.type,
      allowedTypes: this.allowedTypes,
    };
  }
}

export class TimeCondition extends Condition {
  readonly #startTime: string; // HH:mm format
  readonly #endTime: string; // HH:mm format
  readonly #timeZone: string;

  private constructor(
    id: string,
    startTime: string,
    endTime: string,
    timeZone: string,
  ) {
    super(id, ConditionType.Time);
    this.#startTime = startTime;
    this.#endTime = endTime;
    this.#timeZone = timeZone;
    Object.freeze(this);
  }

  static create(
    id: string,
    startTime: string,
    endTime: string,
    timeZone = "Asia/Tokyo",
  ): TimeCondition {
    if (
      !this.isValidTimeFormat(startTime) ||
      !this.isValidTimeFormat(endTime)
    ) {
      throw new Error("Time must be in HH:mm format");
    }

    return new TimeCondition(id, startTime, endTime, timeZone);
  }

  static reconstruct(
    id: string,
    startTime: string,
    endTime: string,
    timeZone: string,
  ): TimeCondition {
    return new TimeCondition(id, startTime, endTime, timeZone);
  }

  private static isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  get startTime(): string {
    return this.#startTime;
  }

  get endTime(): string {
    return this.#endTime;
  }

  get timeZone(): string {
    return this.#timeZone;
  }

  matches(message: IncomingMessage): boolean {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.#timeZone,
    });

    return this.isTimeInRange(timeString, this.#startTime, this.#endTime);
  }

  private isTimeInRange(current: string, start: string, end: string): boolean {
    const currentMinutes = this.timeToMinutes(current);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00-17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 22:00-06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  toJSON(): any {
    return {
      type: this.type,
      startTime: this.#startTime,
      endTime: this.#endTime,
      timeZone: this.#timeZone,
    };
  }
}

export class UserCondition extends Condition {
  readonly #targetUsers: Set<string>;
  readonly #includeMode: boolean; // true: include only these users, false: exclude these users

  private constructor(id: string, targetUsers: string[], includeMode: boolean) {
    super(id, ConditionType.User);
    this.#targetUsers = new Set(targetUsers);
    this.#includeMode = includeMode;
    Object.freeze(this);
  }

  static create(
    id: string,
    targetUsers: string[],
    includeMode = true,
  ): UserCondition {
    if (!targetUsers || targetUsers.length === 0) {
      throw new Error("At least one user ID must be specified");
    }

    return new UserCondition(id, targetUsers, includeMode);
  }

  static reconstruct(
    id: string,
    targetUsers: string[],
    includeMode: boolean,
  ): UserCondition {
    return new UserCondition(id, targetUsers, includeMode);
  }

  get targetUsers(): string[] {
    return Array.from(this.#targetUsers);
  }

  get includeMode(): boolean {
    return this.#includeMode;
  }

  matches(message: IncomingMessage): boolean {
    const hasUser = this.#targetUsers.has(message.userId);
    return this.#includeMode ? hasUser : !hasUser;
  }

  toJSON(): any {
    return {
      type: this.type,
      targetUsers: this.targetUsers,
      includeMode: this.#includeMode,
    };
  }

  static fromJSON(data: any): Condition {
    const id = crypto.randomUUID();

    switch (data.type) {
      case ConditionType.Keyword:
        return KeywordCondition.reconstruct(
          id,
          data.keyword,
          data.mode as KeywordMatchMode,
          data.caseSensitive,
        );

      case ConditionType.Regex:
        return RegexCondition.reconstruct(id, data.pattern, data.flags);

      case ConditionType.MessageType:
        return MessageTypeCondition.reconstruct(
          id,
          data.targetTypes as MessageType[],
        );

      case ConditionType.Time:
        return TimeCondition.reconstruct(
          id,
          data.startTime,
          data.endTime,
          data.timeZone,
        );

      case ConditionType.User:
        return UserCondition.reconstruct(
          id,
          data.targetUsers,
          data.includeMode,
        );

      default:
        throw new Error(`Unsupported condition type: ${data.type}`);
    }
  }
}
