'use client'
import { useState } from 'react'
import type { AutoReplyRule, CreateAutoReplyRuleRequest } from '@/lib/api-client'
import { useAutoReplyForm, type AutoReplyFormValues } from '../_hooks/use-auto-reply-form'

interface RuleFormProps {
  rule?: AutoReplyRule
  onSubmit: (data: CreateAutoReplyRuleRequest) => Promise<void>
  onCancel: () => void
  existingRulesCount: number
}

export function RuleForm({ rule, onSubmit, onCancel, existingRulesCount }: RuleFormProps) {
  // keywordsはUI上カンマ区切り文字列で管理
  const [keywordsInput, setKeywordsInput] = useState(rule?.keywords?.join(', ') ?? '')
  const [keywordsError, setKeywordsError] = useState<string | null>(null)

  // React Hook Form初期化
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useAutoReplyForm({
    type: rule?.type ?? 'keyword',
    name: rule?.name ?? '',
    keywords: rule?.keywords ?? [],
    matchType: rule?.matchType ?? 'partial',
    replyMessage: rule?.replyMessage ?? '',
    priority: rule?.priority ?? 1,
    isEnabled: rule?.isEnabled ?? true
  })

  // リアルタイム監視
  const type = watch('type')
  const replyMessage = watch('replyMessage')
  const name = watch('name')

  // フォーム送信処理
  const onSubmitForm = async (data: AutoReplyFormValues) => {
    // エラーリセット
    setKeywordsError(null)

    // 最大5件チェック（zodスキーマ外のビジネスロジック）
    if (!rule && existingRulesCount >= 5) {
      return
    }

    // keywordsInputを配列に変換
    const keywords = data.type === 'keyword'
      ? keywordsInput.split(',').map(k => k.trim()).filter(Boolean)
      : undefined

    // keyword型の場合のkeywords検証
    if (data.type === 'keyword') {
      if (!keywords || keywords.length === 0) {
        setKeywordsError('反応する言葉を入力してください')
        return
      }
      if (keywords.length > 10) {
        setKeywordsError('反応する言葉は最大10個までです')
        return
      }
    }

    const requestData: CreateAutoReplyRuleRequest = {
      type: data.type,
      name: data.name.trim(),
      keywords,
      matchType: data.type === 'keyword' ? data.matchType : undefined,
      replyMessage: data.replyMessage.trim(),
      priority: data.priority,
      isEnabled: data.isEnabled
    }

    try {
      await onSubmit(requestData)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">

      {/* タイプ選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">返信のタイミング</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('type', 'follow')}
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
            onClick={() => setValue('type', 'keyword')}
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
          placeholder="例: 営業時間外の自動返信"
          maxLength={50}
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
          {...register('name')}
        />
        {errors.name?.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>}
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
            {keywordsError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{keywordsError}</p>}
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
                  {...register('matchType')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">部分一致（おすすめ）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="exact"
                  {...register('matchType')}
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
          placeholder="お客様に送信するメッセージを入力してください"
          maxLength={1000}
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          {...register('replyMessage')}
        />
        {errors.replyMessage?.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.replyMessage.message}</p>}
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
          className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
          {...register('priority', { valueAsNumber: true })}
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
