# AutoReplyRuleV2 - Specification/Command/Policy Architecture

**Domain Service を使わない直感的なドメイン設計**

## 🎯 概要

`AutoReplyRuleV2` は、複雑になったAutoReplyRuleを **Specification/Command/Policy パターン** で責務分離し、Domain Service を使わずに直感的で保守性の高い設計を実現します。

### 3つの責務分離

```
Specification = 「いつ発火するか」の条件判定
Command      = 「何をするか」のアクション実行  
Policy       = 「いくつまで」の制限・ルール
```

## 🚀 基本的な使用方法

### シンプルなルール作成

```typescript
import { RuleBuilder, SpecificationBuilder, CommandBuilder } from './autoReplyV2';

// キーワード「こんにちは」でテキスト返信
const rule = RuleBuilder
  .when(SpecificationBuilder.keyword('こんにちは'))
  .then(CommandBuilder.text('お疲れ様です！'))
  .forAccount('account-001')
  .named('挨拶ルール')
  .build();
```

### 複雑な条件の組み合わせ

```typescript
// 複数条件 AND/OR
const complexRule = RuleBuilder
  .when(
    SpecificationBuilder.keyword('配信')
      .or(SpecificationBuilder.keyword('ライブ'))
      .and(SpecificationBuilder.textOnly())
      .and(SpecificationBuilder.timeWindow('09:00', '21:00'))
  )
  .then(
    CommandBuilder.oneOf(
      CommandBuilder.text('配信は20時からです！'),
      CommandBuilder.sticker('446', '1988')
    )
  )
  .forAccount('vtuber-001')
  .named('配信案内ルール')
  .limitTo(1, 300) // 5分に1回まで
  .build();
```

### メッセージ処理

```typescript
const message = IncomingMessage.create(/* ... */);
const handled = await rule.handleMessage(message);

if (handled) {
  console.log('ルールが発火しました！');
}
```

## 📚 主要コンポーネント

### Specification (条件判定)

メッセージが条件を満たすかを判定する責務

```typescript
// キーワード条件
SpecificationBuilder.keyword('こんにちは', KeywordMatchMode.Exact)

// 正規表現条件  
SpecificationBuilder.regex('(配信|ストリーム)', 'i')

// 時間範囲条件
SpecificationBuilder.timeWindow('09:00', '18:00', 'Asia/Tokyo')

// メッセージタイプ条件
SpecificationBuilder.textOnly()
SpecificationBuilder.messageType(MessageType.Text, MessageType.Image)

// 複合条件
spec1.and(spec2).or(spec3).not()
```

### Command (アクション実行)

「何をするか」を実行する責務

```typescript
// テキスト返信
CommandBuilder.text('こんにちは！', 0.8) // 80%の確率

// スタンプ返信
CommandBuilder.sticker('446', '1988')

// 画像返信  
CommandBuilder.image('https://example.com/image.jpg', 'https://example.com/preview.jpg')

// 複数返信
CommandBuilder.all(
  CommandBuilder.text('こんにちは！'),
  CommandBuilder.sticker('446', '1988')
)

// ランダム選択
CommandBuilder.oneOf(
  CommandBuilder.text('パターン1'),
  CommandBuilder.text('パターン2'),
  CommandBuilder.text('パターン3')
)
```

### Policy (制限・ルール)

「いくつまで」実行可能かを管理する責務

```typescript
// レート制限あり
.limitTo(5, 60, RateLimitScope.User, storage) // 1分間にユーザー毎5回まで

// レート制限なし  
.noRateLimit()

// カスタムポリシー
const customPolicy = new SlidingWindowPolicy(10, 300, RateLimitScope.Global, storage);
```

## 🏗️ 高度な使用例

### VTuber向け自動返信システム

```typescript
const vtuberRule = RuleBuilder
  .when(
    SpecificationBuilder.keyword('応援')
      .or(SpecificationBuilder.keyword('頑張'))
      .and(SpecificationBuilder.textOnly())
  )
  .then(
    CommandBuilder.all(
      CommandBuilder.text('ありがとうございます！💖'),
      CommandBuilder.sticker('446', '1999')
    )
  )
  .forAccount('vtuber-hoshimachi')
  .named('ファンメッセージ感謝')
  .withPriority(8)
  .limitTo(3, 600, RateLimitScope.User, storage) // 10分に3回まで
  .build();
```

### 営業時間外対応

```typescript
const afterHoursRule = RuleBuilder
  .when(
    SpecificationBuilder.timeWindow('22:00', '09:00') // 夜間
      .and(SpecificationBuilder.textOnly())
  )
  .then(
    CommandBuilder.text('現在は営業時間外です。翌営業日にお返事いたします。')
  )
  .forAccount('business-account')
  .named('営業時間外対応')
  .withPriority(9) // 高優先度
  .limitTo(1, 1800, RateLimitScope.User, storage) // 30分に1回
  .build();
```

## 🧪 テスト

```bash
# テスト実行
npm test src/domain/__tests__/AutoReplyRuleV2.test.ts

# デモ実行
npm run demo:autoreply
```

## 🔄 マイグレーション

既存の `AutoReplyRule` から `AutoReplyRuleV2` への移行:

### Before (旧方式)
```typescript
const conditions = [
  KeywordCondition.create(id, 'こんにちは', KeywordMatchMode.Partial),
  TimeCondition.create(id, '09:00', '18:00')
];

const responses = [
  Response.createText(id, 'お疲れ様です！')
];

const rule = AutoReplyRule.create(id, accountId, name, priority, conditions, responses);
```

### After (新方式)
```typescript
const rule = RuleBuilder
  .when(
    SpecificationBuilder.keyword('こんにちは')
      .and(SpecificationBuilder.timeWindow('09:00', '18:00'))
  )
  .then(CommandBuilder.text('お疲れ様です！'))
  .forAccount(accountId)
  .named(name)
  .withPriority(priority)
  .build();
```

## 🎨 利点

### ✅ 直感性
- 自然言語に近いDSL記述
- 「when-then」の明確な構造
- 条件とアクションの分離が直感的

### ✅ 保守性
- 各パターンが独立してテスト可能
- 新しい条件・アクションの追加が容易
- 複雑な組み合わせも読みやすい

### ✅ 拡張性
- 新しいSpecification/Command/Policyを簡単追加
- 既存コードに影響なし
- Domain Serviceが不要

### ✅ 型安全性
- TypeScriptによる完全な型チェック
- コンパイル時エラー検出
- IDEの優秀な補完機能

## 📁 ファイル構成

```
src/domain/
├── specifications/     # Specificationパターン
│   ├── MessageSpecification.ts
│   ├── KeywordSpecification.ts
│   ├── RegexSpecification.ts
│   └── CompositeSpecification.ts
├── commands/           # Commandパターン  
│   ├── ReplyCommand.ts
│   ├── TextReplyCommand.ts
│   └── CompositeReplyCommand.ts
├── policies/           # Policyパターン
│   ├── RateLimitPolicy.ts
│   └── SlidingWindowPolicy.ts
├── builders/           # Builderパターン
│   ├── RuleBuilder.ts
│   └── HelperBuilders.ts
├── entities/
│   └── AutoReplyRuleV2.ts
├── examples/
│   └── AutoReplyDemo.ts
└── autoReplyV2/
    ├── index.ts        # 統合エクスポート
    └── README.md       # このファイル
```

## 🤝 貢献

新しいSpecification/Command/Policyの追加方法:

1. 対応するインターフェースを実装
2. ヘルパービルダーにメソッド追加
3. テストケース作成
4. このREADMEを更新

---

**🌟 Domain Service不要の直感的設計で、保守性の高い自動返信システムを構築できます！**