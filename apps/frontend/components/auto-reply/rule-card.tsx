'use client'
import type { AutoReplyRule } from '@/lib/api-client'

interface RuleCardProps {
  rule: AutoReplyRule
  onEdit: (rule: AutoReplyRule) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isEnabled: boolean) => void
}

export function RuleCard({ rule, onEdit, onDelete, onToggle }: RuleCardProps) {
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
          <button
            onClick={() => onEdit(rule)}
            className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => onToggle(rule.id, !rule.isEnabled)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              rule.isEnabled
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20'
            }`}
          >
            {rule.isEnabled ? '有効' : '無効'}
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="text-xs px-3 py-1.5 rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
          >
            削除
          </button>
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
