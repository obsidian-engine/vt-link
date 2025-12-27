'use client'
import { useState, useEffect } from 'react'
import type { AutoReplyRule, CreateAutoReplyRuleRequest } from '@/lib/api-client'

interface RuleFormProps {
  rule?: AutoReplyRule
  onSubmit: (data: CreateAutoReplyRuleRequest) => Promise<void>
  onCancel: () => void
  existingRulesCount: number
}

export function RuleForm({ rule, onSubmit, onCancel, existingRulesCount }: RuleFormProps) {
  const [type, setType] = useState<'follow' | 'keyword'>(rule?.type ?? 'keyword')
  const [name, setName] = useState(rule?.name ?? '')
  const [keywordsInput, setKeywordsInput] = useState(rule?.keywords?.join(', ') ?? '')
  const [matchType, setMatchType] = useState<'exact' | 'partial'>(rule?.matchType ?? 'partial')
  const [replyMessage, setReplyMessage] = useState(rule?.replyMessage ?? '')
  const [priority, setPriority] = useState(rule?.priority ?? 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'ルール名を入力してください'
    } else if (name.length > 50) {
      newErrors.name = 'ルール名は50文字以内で入力してください'
    }

    if (type === 'keyword') {
      const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean)
      if (keywords.length === 0) {
        newErrors.keywords = '反応する言葉を入力してください'
      } else if (keywords.length > 10) {
        newErrors.keywords = '反応する言葉は最大10個までです'
      }
    }

    if (!replyMessage.trim()) {
      newErrors.replyMessage = '返信メッセージを入力してください'
    } else if (replyMessage.length > 1000) {
      newErrors.replyMessage = '返信メッセージは1000文字以内で入力してください'
    }

    if (!rule && existingRulesCount >= 5) {
      newErrors.general = 'ルールは最大5件までです'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const keywords = type === 'keyword' 
        ? keywordsInput.split(',').map(k => k.trim()).filter(Boolean)
        : undefined

      const data: CreateAutoReplyRuleRequest = {
        type,
        name: name.trim(),
        keywords,
        matchType: type === 'keyword' ? matchType : undefined,
        replyMessage: replyMessage.trim(),
        priority,
        isEnabled: true
      }

      await onSubmit(data)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : '保存に失敗しました' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
          {errors.general}
        </div>
      )}

      {/* タイプ選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">返信のタイミング</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('follow')}
            className={`p-3 rounded-lg border transition-colors ${
              type === 'follow'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="font-medium">友だち追加時</div>
            <div className="text-xs text-muted-foreground mt-1">友だち追加されたときに送信</div>
          </button>
          <button
            type="button"
            onClick={() => setType('keyword')}
            className={`p-3 rounded-lg border transition-colors ${
              type === 'keyword'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="font-medium">反応する言葉</div>
            <div className="text-xs text-muted-foreground mt-1">特定の言葉に反応して送信</div>
          </button>
        </div>
      </div>

      {/* ルール名 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          ルール名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 営業時間外の自動返信"
          maxLength={50}
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{name.length}/50文字</p>
      </div>

      {/* キーワード入力（typeがkeywordの時のみ） */}
      {type === 'keyword' && (
        <>
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium mb-2">
              反応する言葉 <span className="text-red-500">*</span>
            </label>
            <input
              id="keywords"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="例: 料金, 値段, いくら"
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.keywords && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.keywords}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              カンマ区切りで最大10個まで入力できます（例: 料金, 値段, いくら）
            </p>
          </div>

          {/* マッチ条件 */}
          <div>
            <label className="block text-sm font-medium mb-2">マッチ条件</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="partial"
                  checked={matchType === 'partial'}
                  onChange={() => setMatchType('partial')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">部分一致（おすすめ）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="exact"
                  checked={matchType === 'exact'}
                  onChange={() => setMatchType('exact')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">完全一致</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              部分一致: 「料金は？」でも反応します　完全一致: 「料金」のみ反応します
            </p>
          </div>
        </>
      )}

      {/* 返信メッセージ */}
      <div>
        <label htmlFor="replyMessage" className="block text-sm font-medium mb-2">
          返信メッセージ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="replyMessage"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="お客様に送信するメッセージを入力してください"
          maxLength={1000}
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        {errors.replyMessage && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.replyMessage}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{replyMessage.length}/1000文字</p>
      </div>

      {/* プレビュー */}
      {replyMessage && (
        <div>
          <label className="block text-sm font-medium mb-2">プレビュー</label>
          <div className="rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                店
              </div>
              <div className="flex-1">
                <div className="inline-block bg-white dark:bg-slate-700 rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">{replyMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 優先度 */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium mb-2">
          優先度（1-5）
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {[1, 2, 3, 4, 5].map(p => (
            <option key={p} value={p}>
              {p} {p === 1 ? '(最低)' : p === 5 ? '(最高)' : ''}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          複数のルールに一致した場合、優先度が高いものが適用されます
        </p>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '保存中...' : rule ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg border border-input hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
