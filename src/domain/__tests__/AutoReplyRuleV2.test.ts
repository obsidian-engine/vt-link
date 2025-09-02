/**
 * AutoReplyRuleV2 統合テスト
 * Specification/Command/Policyパターンの動作確認
 */

import { AutoReplyRuleV2 } from "../entities/AutoReplyRuleV2";
import {
  IncomingMessage,
  MessageType,
  MessageSource,
} from "../entities/IncomingMessage";
import {
  KeywordSpecification,
  RegexSpecification,
  MessageTypeSpecification,
  KeywordMatchMode,
} from "../specifications";
import {
  TextReplyCommand,
  StickerReplyCommand,
  CompositeReplyCommand,
} from "../commands";
import {
  RateLimitPolicy,
  RateLimitScope,
  SlidingWindowPolicy,
  NoRateLimitPolicy,
  RateLimitStorage,
} from "../policies";
import { RuleBuilder, SpecificationBuilder, CommandBuilder } from "../builders";

// Mock RateLimitStorage for testing
class MockRateLimitStorage implements RateLimitStorage {
  private executions: Map<string, Date[]> = new Map();

  async getExecutionCount(key: string, windowSeconds: number): Promise<number> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - windowSeconds * 1000);
    const keyExecutions = this.executions.get(key) || [];

    return keyExecutions.filter((date) => date > cutoff).length;
  }

  async recordExecution(key: string): Promise<void> {
    const keyExecutions = this.executions.get(key) || [];
    keyExecutions.push(new Date());
    this.executions.set(key, keyExecutions);
  }
}

describe("AutoReplyRuleV2 Integration Tests", () => {
  let mockStorage: MockRateLimitStorage;
  let testMessage: IncomingMessage;
  let testSource: MessageSource;

  beforeEach(() => {
    mockStorage = new MockRateLimitStorage();
    testSource = {
      type: "user",
      userId: "test-user-123",
    };

    testMessage = IncomingMessage.create(
      "msg-001",
      MessageType.Text,
      "こんにちは",
      testSource,
      new Date(),
      "reply-token-001",
    ).value() as IncomingMessage;
  });

  describe("Basic Rule Creation and Execution", () => {
    test("キーワード条件でテキスト返信するルールの動作", async () => {
      // Arrange
      const trigger = new KeywordSpecification(
        "こんにちは",
        KeywordMatchMode.Partial,
      );
      const response = new TextReplyCommand("お疲れ様です！");

      const rule = AutoReplyRuleV2.create(
        "rule-001",
        "account-001",
        "テストルール",
        1,
        trigger,
        response,
        null,
        true,
      );

      // Act
      const result = await rule.handleMessage(testMessage);

      // Assert
      expect(result).toBe(true);
      expect(rule.enabled).toBe(true);
      expect(rule.name).toBe("テストルール");
    });

    test("条件に合わないメッセージは処理されない", async () => {
      // Arrange
      const trigger = new KeywordSpecification(
        "さようなら",
        KeywordMatchMode.Exact,
      );
      const response = new TextReplyCommand("またね！");

      const rule = AutoReplyRuleV2.create(
        "rule-002",
        "account-001",
        "さよならルール",
        1,
        trigger,
        response,
      );

      // Act - 'こんにちは'メッセージに対して'さようなら'ルールを適用
      const result = await rule.handleMessage(testMessage);

      // Assert
      expect(result).toBe(false);
    });

    test("無効なルールは実行されない", async () => {
      // Arrange
      const trigger = new KeywordSpecification("こんにちは");
      const response = new TextReplyCommand("お疲れ様です！");

      const rule = AutoReplyRuleV2.create(
        "rule-003",
        "account-001",
        "無効ルール",
        1,
        trigger,
        response,
        null,
        false, // 無効
      );

      // Act
      const result = await rule.handleMessage(testMessage);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("Rate Limiting", () => {
    test("レート制限により実行が制限される", async () => {
      // Arrange - 1分間に1回まで
      const rateLimit = new SlidingWindowPolicy(
        1,
        60,
        RateLimitScope.User,
        mockStorage,
      );
      const trigger = new KeywordSpecification("こんにちは");
      const response = new TextReplyCommand("こんにちは！");

      const rule = AutoReplyRuleV2.create(
        "rule-004",
        "account-001",
        "レート制限ルール",
        1,
        trigger,
        response,
        rateLimit,
      );

      // Act & Assert
      // 1回目は成功
      const result1 = await rule.handleMessage(testMessage);
      expect(result1).toBe(true);

      // 2回目は制限される
      const result2 = await rule.handleMessage(testMessage);
      expect(result2).toBe(false);
    });

    test("NoRateLimitPolicyでは制限されない", async () => {
      // Arrange
      const noRateLimit = new NoRateLimitPolicy();
      const trigger = new KeywordSpecification("こんにちは");
      const response = new TextReplyCommand("こんにちは！");

      const rule = AutoReplyRuleV2.create(
        "rule-005",
        "account-001",
        "無制限ルール",
        1,
        trigger,
        response,
        noRateLimit,
      );

      // Act & Assert
      const result1 = await rule.handleMessage(testMessage);
      expect(result1).toBe(true);

      const result2 = await rule.handleMessage(testMessage);
      expect(result2).toBe(true);
    });
  });

  describe("RuleBuilder DSL", () => {
    test("RuleBuilderを使った直感的なルール作成", async () => {
      // Arrange
      const rule = RuleBuilder.create()
        .forAccount("account-001")
        .named("Builder作成ルール")
        .withPriority(5)
        .when(SpecificationBuilder.keyword("テスト"))
        .then(CommandBuilder.text("テスト成功！"))
        .noRateLimit()
        .build();

      const testMsg = IncomingMessage.create(
        "msg-002",
        MessageType.Text,
        "テスト実行中",
        testSource,
        new Date(),
        "reply-token-002",
      ).value() as IncomingMessage;

      // Act
      const result = await rule.handleMessage(testMsg);

      // Assert
      expect(result).toBe(true);
      expect(rule.name).toBe("Builder作成ルール");
      expect(rule.priority).toBe(5);
    });

    test("複合条件とコマンドの組み合わせ", async () => {
      // Arrange - 「hello」キーワード AND テキストメッセージのみ
      const complexTrigger = SpecificationBuilder.keyword("hello").and(
        SpecificationBuilder.textOnly(),
      );

      const comboResponse = CommandBuilder.all(
        CommandBuilder.text("Hello!"),
        CommandBuilder.text("How are you?"),
      );

      const rule = RuleBuilder.create()
        .forAccount("account-001")
        .named("複合ルール")
        .when(complexTrigger)
        .then(comboResponse)
        .noRateLimit()
        .build();

      const helloMsg = IncomingMessage.create(
        "msg-003",
        MessageType.Text,
        "hello world",
        testSource,
        new Date(),
        "reply-token-003",
      ).value() as IncomingMessage;

      // Act
      const result = await rule.handleMessage(helloMsg);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("Rule Updates", () => {
    test("ルール名更新", () => {
      // Arrange
      const rule = AutoReplyRuleV2.create(
        "rule-006",
        "account-001",
        "元の名前",
        1,
        new KeywordSpecification("test"),
        new TextReplyCommand("test"),
      );

      // Act
      const updatedRule = rule.updateName("新しい名前");

      // Assert
      expect(updatedRule.name).toBe("新しい名前");
      expect(updatedRule.id).toBe(rule.id); // IDは変わらない
      expect(updatedRule).not.toBe(rule); // 新しいインスタンス
    });

    test("優先度更新", () => {
      // Arrange
      const rule = AutoReplyRuleV2.create(
        "rule-007",
        "account-001",
        "テスト",
        5,
        new KeywordSpecification("test"),
        new TextReplyCommand("test"),
      );

      // Act
      const updatedRule = rule.updatePriority(10);

      // Assert
      expect(updatedRule.priority).toBe(10);
      expect(updatedRule).not.toBe(rule);
    });

    test("有効・無効切り替え", () => {
      // Arrange
      const rule = AutoReplyRuleV2.create(
        "rule-008",
        "account-001",
        "テスト",
        1,
        new KeywordSpecification("test"),
        new TextReplyCommand("test"),
        null,
        true,
      );

      // Act
      const disabledRule = rule.disable();
      const enabledRule = disabledRule.enable();

      // Assert
      expect(rule.enabled).toBe(true);
      expect(disabledRule.enabled).toBe(false);
      expect(enabledRule.enabled).toBe(true);
    });
  });
});

// 実行例のデモ用関数
export function demoUsage() {
  console.log("=== AutoReplyRuleV2 Demo ===");

  // DSLを使った直感的なルール作成例
  const rule = RuleBuilder.when(
    SpecificationBuilder.keyword("こんにちは").and(
      SpecificationBuilder.textOnly(),
    ),
  )
    .then(
      CommandBuilder.oneOf(
        CommandBuilder.text("こんにちは！"),
        CommandBuilder.text("お疲れ様です！"),
        CommandBuilder.sticker("446", "1988"),
      ),
    )
    .forAccount("vtuber-account-001")
    .named("挨拶ルール")
    .withPriority(10)
    // .limitTo(5, 60, RateLimitScope.User, storage)  // 1分間に5回まで
    .noRateLimit()
    .build();

  console.log(`Created rule: ${rule.name} (Priority: ${rule.priority})`);
  console.log("Ready to handle messages!");
}
