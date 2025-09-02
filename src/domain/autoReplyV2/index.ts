/**
 * AutoReplyRuleV2 - Specification/Command/Policy Pattern
 * 
 * Domain Service を使わずに責務分離を実現する新アーキテクチャ
 * - Specification: 「いつ発火するか」の条件判定
 * - Command: 「何をするか」のアクション実行  
 * - Policy: 「いくつまで」の制限・ルール
 */

// ===== ENTITIES =====
export { AutoReplyRuleV2 } from '../entities/AutoReplyRuleV2';

// ===== SPECIFICATIONS (いつ発火するか) =====
export {
  MessageSpecification,
  CompositeSpecification,
  AndSpecification, 
  OrSpecification,
  NotSpecification,
  KeywordSpecification,
  RegexSpecification,
  TimeWindowSpecification,
  MessageTypeSpecification,
  KeywordMatchMode,
  MessageType
} from '../specifications';

// ===== COMMANDS (何をするか) =====
export {
  ReplyCommand,
  MessageContext,
  TextReplyCommand,
  StickerReplyCommand,
  ImageReplyCommand,
  CompositeReplyCommand
} from '../commands';

// ===== POLICIES (いくつまで・制限) =====
export {
  RateLimitPolicy,
  RateLimitScope,
  SlidingWindowPolicy,
  NoRateLimitPolicy,
  RateLimitStorage
} from '../policies';

// ===== BUILDERS (組み立て支援) =====
export {
  RuleBuilder,
  SpecificationBuilder,
  CommandBuilder,
  PresetBuilder
} from '../builders';

// ===== EXAMPLES & DEMOS =====
export {
  VTuberAutoReplyDemo,
  runVTuberDemo,
  createCustomRule
} from '../examples/AutoReplyDemo';

// 既存エンティティとの互換性
export { IncomingMessage, MessageSource } from '../entities/IncomingMessage';