/**
 * AutoReplyRuleV2 実用例デモ
 * 新しいSpecification/Command/Policyパターンの活用例
 */

import { CommandBuilder, RuleBuilder, SpecificationBuilder } from '../builders';
import type { AutoReplyRuleV2 } from '../entities/AutoReplyRuleV2';
import { IncomingMessage, type MessageSource, MessageType } from '../entities/IncomingMessage';
import { RateLimitScope, type RateLimitStorage, SlidingWindowPolicy } from '../policies';

// デモ用のシンプルなレート制限ストレージ実装
class DemoRateLimitStorage implements RateLimitStorage {
  private executions = new Map<string, Date[]>();

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

/**
 * VTuber用AutoReplyシステムのデモ
 */
export class VTuberAutoReplyDemo {
  private rules: AutoReplyRuleV2[] = [];
  private storage = new DemoRateLimitStorage();

  constructor() {
    this.setupVTuberRules();
  }

  /**
   * VTuber向けの典型的なルールを設定
   */
  private setupVTuberRules(): void {
    // 1. 挨拶ルール
    const greetingRule = RuleBuilder.when(
      SpecificationBuilder.keyword('こんにちは')
        .or(SpecificationBuilder.keyword('おはよう'))
        .or(SpecificationBuilder.keyword('こんばんは'))
        .and(SpecificationBuilder.textOnly())
    )
      .then(
        CommandBuilder.oneOf(
          CommandBuilder.text('こんにちは〜！✨'),
          CommandBuilder.text('お疲れ様です！💪'),
          CommandBuilder.sticker('446', '1988'), // LINE公式スタンプ
          CommandBuilder.all(
            CommandBuilder.text('ごきげんよう〜！'),
            CommandBuilder.sticker('446', '1990')
          )
        )
      )
      .forAccount('vtuber-hoshimachi-001')
      .named('挨拶自動返信')
      .withPriority(10)
      .limitTo(3, 60, RateLimitScope.User, this.storage) // 1分に3回まで
      .build();

    // 2. 配信関連質問ルール
    const streamRule = RuleBuilder.when(
      SpecificationBuilder.regex('(配信|ストリーム|ライブ).*[？?]', 'i').and(
        SpecificationBuilder.textOnly()
      )
    )
      .then(CommandBuilder.text('次回配信は明日の20時からです！お楽しみに〜🎮✨'))
      .forAccount('vtuber-hoshimachi-001')
      .named('配信予定案内')
      .withPriority(8)
      .limitTo(1, 300, RateLimitScope.Global, this.storage) // 5分に1回（全体で）
      .build();

    // 3. 営業時間外対応ルール
    const afterHoursRule = RuleBuilder.when(
      SpecificationBuilder.timeWindow('00:00', '09:00')
        .or(SpecificationBuilder.timeWindow('22:00', '23:59'))
        .and(SpecificationBuilder.textOnly())
    )
      .then(
        CommandBuilder.text('お疲れ様です！現在は休憩時間ですが、メッセージありがとうございます💤')
      )
      .forAccount('vtuber-hoshimachi-001')
      .named('営業時間外自動返信')
      .withPriority(5)
      .limitTo(1, 1800, RateLimitScope.User, this.storage) // 30分に1回
      .build();

    // 4. スタンプ反応ルール
    const stickerReactionRule = RuleBuilder.when(SpecificationBuilder.stickerOnly())
      .then(
        CommandBuilder.oneOf(
          CommandBuilder.sticker('446', '2000'),
          CommandBuilder.sticker('446', '2001'),
          CommandBuilder.text('可愛いスタンプですね〜！😊')
        )
      )
      .forAccount('vtuber-hoshimachi-001')
      .named('スタンプ反応')
      .withPriority(3)
      .limitTo(2, 120, RateLimitScope.User, this.storage) // 2分に2回まで
      .build();

    // 5. ファンメッセージ感謝ルール
    const fanMessageRule = RuleBuilder.when(
      SpecificationBuilder.regex('(応援|頑張|ファン|好き|愛)', 'i').and(
        SpecificationBuilder.textOnly()
      )
    )
      .then(
        CommandBuilder.all(
          CommandBuilder.text('ありがとうございます！とても嬉しいです💖'),
          CommandBuilder.sticker('446', '1999')
        )
      )
      .forAccount('vtuber-hoshimachi-001')
      .named('ファンメッセージ感謝')
      .withPriority(7)
      .limitTo(5, 600, RateLimitScope.User, this.storage) // 10分に5回まで
      .build();

    this.rules = [greetingRule, streamRule, afterHoursRule, stickerReactionRule, fanMessageRule];

    // 優先度でソート（高い順）
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * メッセージを処理する
   */
  async processMessage(message: IncomingMessage): Promise<{
    handled: boolean;
    triggeredRules: string[];
  }> {
    const triggeredRules: string[] = [];
    let handled = false;

    for (const rule of this.rules) {
      const result = await rule.handleMessage(message);
      if (result) {
        triggeredRules.push(rule.name);
        handled = true;

        // 優先度が高いルールが発火したら終了（必要に応じて）
        if (rule.priority >= 8) {
          break;
        }
      }
    }

    return { handled, triggeredRules };
  }

  /**
   * ルール一覧を取得
   */
  getRules(): Array<{
    name: string;
    priority: number;
    enabled: boolean;
  }> {
    return this.rules.map((rule) => ({
      name: rule.name,
      priority: rule.priority,
      enabled: rule.enabled,
    }));
  }
}

/**
 * デモ実行例
 */
export async function runVTuberDemo(): Promise<void> {
  console.log('🌟 VTuber AutoReply System Demo 🌟\n');

  const autoReply = new VTuberAutoReplyDemo();

  console.log('設定済みルール:');
  autoReply.getRules().forEach((rule, index) => {
    console.log(`  ${index + 1}. ${rule.name} (優先度: ${rule.priority})`);
  });
  console.log('');

  // テストメッセージを作成
  const testSource: MessageSource = {
    type: 'user',
    userId: 'fan-user-12345',
  };

  const testMessages = [
    {
      text: 'こんにちは！',
      expected: ['挨拶自動返信'],
    },
    {
      text: '次の配信はいつですか？',
      expected: ['配信予定案内'],
    },
    {
      text: 'いつも応援してます！頑張って！',
      expected: ['ファンメッセージ感謝'],
    },
    {
      text: '普通のメッセージです',
      expected: [],
    },
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const testCase = testMessages[i];
    const message = IncomingMessage.create(
      `test-msg-${i + 1}`,
      MessageType.Text,
      testCase.text,
      testSource,
      new Date(),
      `reply-token-${i + 1}`
    ).value() as IncomingMessage;

    console.log(`📨 テストメッセージ: "${testCase.text}"`);

    const result = await autoReply.processMessage(message);

    if (result.handled) {
      console.log(`✅ 処理済み - 発火ルール: ${result.triggeredRules.join(', ')}`);
    } else {
      console.log('❌ 処理されませんでした');
    }

    console.log('');
  }

  console.log('🎉 Demo completed!\n');
}

/**
 * カスタムルール作成例
 */
export function createCustomRule(): AutoReplyRuleV2 {
  console.log('🔧 カスタムルール作成例\n');

  // 複雑な条件の組み合わせ例
  const customRule = RuleBuilder.when(
    // (キーワード「ゲーム」OR「プレイ」) AND テキストメッセージ AND 営業時間内
    SpecificationBuilder.keyword('ゲーム')
      .or(SpecificationBuilder.keyword('プレイ'))
      .and(SpecificationBuilder.textOnly())
      .and(SpecificationBuilder.timeWindow('09:00', '21:00'))
  )
    .then(
      // 複数の返信パターンから確率で選択
      CommandBuilder.oneOf(
        CommandBuilder.text('今日はApex Legendsをプレイ予定です！🎮'),
        CommandBuilder.text('ゲーム配信楽しみにしててください〜✨'),
        CommandBuilder.all(
          CommandBuilder.text('一緒にゲームしましょう！'),
          CommandBuilder.sticker('446', '2010')
        )
      )
    )
    .forAccount('vtuber-gamer-001')
    .named('ゲーム関連自動返信')
    .withPriority(6)
    .limitTo(2, 180, RateLimitScope.User, new DemoRateLimitStorage()) // 3分に2回まで
    .build();

  console.log(`✨ カスタムルール作成完了: ${customRule.name}`);
  console.log(`   優先度: ${customRule.priority}`);
  console.log(`   有効: ${customRule.enabled ? 'Yes' : 'No'}\n`);

  return customRule;
}

// 実行例
if (require.main === module) {
  runVTuberDemo().catch(console.error);
  createCustomRule();
}
