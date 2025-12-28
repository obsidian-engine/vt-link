'use client'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoReplyRule } from '@/lib/api-client'

/** ボタン状態型 - Material Design 3の8状態 */
type ButtonState = 'enabled' | 'disabled' | 'loading' | 'error'

interface RuleCardProps {
  rule: AutoReplyRule
  onEdit: (rule: AutoReplyRule) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isEnabled: boolean) => void
  /** 操作中のボタンを識別するためのローディング状態 */
  loadingAction?: 'edit' | 'toggle' | 'delete' | null
  /** エラー状態のボタン */
  errorAction?: 'edit' | 'toggle' | 'delete' | null
}

/**
 * アクションボタンコンポーネント
 * Material Design 3の8状態を実装:
 * - enabled: 通常状態
 * - disabled: 無効状態
 * - hovered: ホバー状態 (CSS)
 * - focused: フォーカス状態 (CSS)
 * - pressed/active: 押下状態 (CSS)
 * - loading: 読み込み中
 * - error: エラー状態
 * - selected: 選択状態 (toggleボタンで使用)
 */
function ActionButton({
  children,
  onClick,
  state = 'enabled',
  variant = 'default',
  selected = false,
  className,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  state?: ButtonState
  variant?: 'default' | 'success' | 'danger' | 'toggle'
  selected?: boolean
  className?: string
  ariaLabel?: string
}) {
  const isDisabled = state === 'disabled' || state === 'loading'

  const baseStyles = cn(
    // ベーススタイル
    "text-xs min-h-[36px] px-3 py-1.5 rounded-md transition-all",
    // フォーカス状態
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // 無効/ローディング状態
    isDisabled && "opacity-50 cursor-not-allowed",
    // 押下状態
    !isDisabled && "active:scale-[0.97]"
  )

  const variantStyles = {
    default: cn(
      "bg-primary/10 text-primary focus-visible:ring-primary",
      !isDisabled && "hover:bg-primary/20 active:bg-primary/30",
      state === 'error' && "bg-red-100 text-red-700 ring-2 ring-red-500"
    ),
    success: cn(
      selected
        ? "bg-green-500/10 text-green-700 dark:text-green-400"
        : "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      "focus-visible:ring-green-500",
      !isDisabled && (selected
        ? "hover:bg-green-500/20 active:bg-green-500/30"
        : "hover:bg-gray-500/20 active:bg-gray-500/30"),
      state === 'error' && "bg-red-100 text-red-700 ring-2 ring-red-500"
    ),
    danger: cn(
      "text-red-600 dark:text-red-400 focus-visible:ring-red-500",
      !isDisabled && "hover:bg-red-500/10 active:bg-red-500/20",
      state === 'error' && "bg-red-100 ring-2 ring-red-500"
    ),
    toggle: cn(
      selected
        ? "bg-green-500/10 text-green-700 dark:text-green-400"
        : "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      "focus-visible:ring-green-500",
      !isDisabled && (selected
        ? "hover:bg-green-500/20 active:bg-green-500/30"
        : "hover:bg-gray-500/20 active:bg-gray-500/30"),
      state === 'error' && "bg-red-100 text-red-700 ring-2 ring-red-500"
    ),
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={state === 'loading'}
      aria-label={ariaLabel}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {state === 'loading' ? (
        <span className="inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export function RuleCard({ rule, onEdit, onDelete, onToggle, loadingAction, errorAction }: RuleCardProps) {
  const typeColor = rule.type === 'follow' ? 'bg-yellow-500' : 'bg-blue-500'
  const typeLabel = rule.type === 'follow' ? '友だち追加時' : '反応する言葉'

  return (
    <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${typeColor}`}></div>
          <div>
            <h3 className="font-medium">{rule.name}</h3>
            <p className="text-xs text-muted-foreground">{typeLabel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton
            onClick={() => onEdit(rule)}
            state={loadingAction === 'edit' ? 'loading' : errorAction === 'edit' ? 'error' : 'enabled'}
            variant="default"
            ariaLabel={`${rule.name}を編集`}
          >
            編集
          </ActionButton>
          <ActionButton
            onClick={() => onToggle(rule.id, !rule.isEnabled)}
            state={loadingAction === 'toggle' ? 'loading' : errorAction === 'toggle' ? 'error' : 'enabled'}
            variant="toggle"
            selected={rule.isEnabled}
            ariaLabel={`${rule.name}を${rule.isEnabled ? '無効化' : '有効化'}`}
          >
            {rule.isEnabled ? '有効' : '無効'}
          </ActionButton>
          <ActionButton
            onClick={() => onDelete(rule.id)}
            state={loadingAction === 'delete' ? 'loading' : errorAction === 'delete' ? 'error' : 'enabled'}
            variant="danger"
            ariaLabel={`${rule.name}を削除`}
          >
            削除
          </ActionButton>
        </div>
      </div>

      {/* キーワード情報（keyword タイプの場合のみ） */}
      {rule.type === 'keyword' && rule.keywords && rule.keywords.length > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          反応する言葉: {rule.keywords.join(', ')}
          {rule.matchType === 'partial' && ' (部分一致)'}
        </p>
      )}

      {/* 返信メッセージのプレビュー */}
      <div className="text-xs bg-muted/50 rounded p-3 mt-2">
        <p className="text-muted-foreground mb-1">返信メッセージ:</p>
        <p className="whitespace-pre-wrap">{rule.replyMessage}</p>
      </div>

      {/* 優先度表示 */}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>優先度: {rule.priority}</span>
      </div>
    </div>
  )
}
