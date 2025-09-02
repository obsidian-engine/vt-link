import {
  KeywordMatchMode,
  KeywordSpecification,
  type MessageSpecification,
  MessageType,
  MessageTypeSpecification,
  RegexSpecification,
  TimeWindowSpecification,
} from '../specifications';

import {
  CompositeReplyCommand,
  ImageReplyCommand,
  type ReplyCommand,
  StickerReplyCommand,
  TextReplyCommand,
} from '../commands';

/**
 * Specification作成のヘルパー関数
 */
export class SpecificationBuilder {
  /**
   * キーワード条件
   */
  static keyword(
    keyword: string,
    mode: KeywordMatchMode = KeywordMatchMode.Partial,
    caseSensitive = false
  ): MessageSpecification {
    return new KeywordSpecification(keyword, mode, caseSensitive);
  }

  /**
   * 正規表現条件
   */
  static regex(pattern: string, flags = 'i'): MessageSpecification {
    return new RegexSpecification(pattern, flags);
  }

  /**
   * 時間窓条件
   */
  static timeWindow(
    startTime: string,
    endTime: string,
    timeZone = 'Asia/Tokyo'
  ): MessageSpecification {
    return new TimeWindowSpecification(startTime, endTime, timeZone);
  }

  /**
   * メッセージタイプ条件
   */
  static messageType(...types: MessageType[]): MessageSpecification {
    return new MessageTypeSpecification(types);
  }

  /**
   * テキストメッセージのみ
   */
  static textOnly(): MessageSpecification {
    return new MessageTypeSpecification([MessageType.Text]);
  }

  /**
   * 画像メッセージのみ
   */
  static imageOnly(): MessageSpecification {
    return new MessageTypeSpecification([MessageType.Image]);
  }

  /**
   * スタンプメッセージのみ
   */
  static stickerOnly(): MessageSpecification {
    return new MessageTypeSpecification([MessageType.Sticker]);
  }
}

/**
 * Command作成のヘルパー関数
 */
export class CommandBuilder {
  /**
   * テキスト返信
   */
  static text(text: string, probability = 1.0): ReplyCommand {
    return new TextReplyCommand(text, probability);
  }

  /**
   * スタンプ返信
   */
  static sticker(packageId: string, stickerId: string, probability = 1.0): ReplyCommand {
    return new StickerReplyCommand(packageId, stickerId, probability);
  }

  /**
   * 画像返信
   */
  static image(originalUrl: string, previewUrl: string, probability = 1.0): ReplyCommand {
    return new ImageReplyCommand(originalUrl, previewUrl, probability);
  }

  /**
   * 複数返信の組み合わせ（すべて実行）
   */
  static all(...commands: ReplyCommand[]): ReplyCommand {
    return new CompositeReplyCommand(commands, true);
  }

  /**
   * 複数返信の組み合わせ（ランダムに1つ実行）
   */
  static oneOf(...commands: ReplyCommand[]): ReplyCommand {
    return new CompositeReplyCommand(commands, false);
  }
}

/**
 * よく使う組み合わせのプリセット
 */
export class PresetBuilder {
  /**
   * 挨拶ルール
   */
  static greeting(accountId: string, greeting = 'こんにちは'): any {
    return {
      accountId,
      name: '挨拶ルール',
      trigger: SpecificationBuilder.keyword('こんにちは'),
      response: CommandBuilder.text(greeting),
    };
  }

  /**
   * 営業時間ルール
   */
  static businessHours(
    accountId: string,
    startTime = '09:00',
    endTime = '18:00',
    message = '営業時間内です'
  ): any {
    return {
      accountId,
      name: '営業時間ルール',
      trigger: SpecificationBuilder.timeWindow(startTime, endTime),
      response: CommandBuilder.text(message),
    };
  }

  /**
   * スタンプ反応ルール
   */
  static stickerReaction(accountId: string, packageId = '446', stickerId = '1988'): any {
    return {
      accountId,
      name: 'スタンプ反応ルール',
      trigger: SpecificationBuilder.stickerOnly(),
      response: CommandBuilder.sticker(packageId, stickerId),
    };
  }
}
