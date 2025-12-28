'use client'
import { useState } from 'react'
import { RuleCard } from '@/components/auto-reply/rule-card'
import { RuleForm } from '@/components/auto-reply/rule-form'
import {
  useAutoReplyRules,
  createRule,
  updateRule,
  deleteRule,
  bulkUpdateRules
} from '@/lib/hooks/use-auto-reply-rules'
import type { AutoReplyRule, CreateAutoReplyRuleRequest } from '@/lib/api-client'

export default function AutoReplyPage() {
  const { rules, isLoading, isError, mutate } = useAutoReplyRules()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null)
  const [globalEnabled, setGlobalEnabled] = useState(true)

  // ルール作成
  const handleCreate = async (data: CreateAutoReplyRuleRequest) => {
    if (rules.length >= 5) {
      alert('ルールは最大5件までです')
      return
    }

    try {
      await createRule(data)
      await mutate()
      setIsFormOpen(false)
      alert('ルールを作成しました')
    } catch (error) {
      console.error('Failed to create rule:', error)
      alert('ルールの作成に失敗しました')
    }
  }

  // ルール編集
  const handleEdit = (rule: AutoReplyRule) => {
    setEditingRule(rule)
    setIsFormOpen(true)
  }

  // ルール更新
  const handleUpdate = async (data: CreateAutoReplyRuleRequest) => {
    if (!editingRule) return

    try {
      await updateRule(editingRule.id, data)
      await mutate()
      setIsFormOpen(false)
      setEditingRule(null)
      alert('ルールを更新しました')
    } catch (error) {
      console.error('Failed to update rule:', error)
      alert('ルールの更新に失敗しました')
    }
  }

  // ルール削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      await deleteRule(id)
      await mutate()
      alert('ルールを削除しました')
    } catch (error) {
      console.error('Failed to delete rule:', error)
      alert('ルールの削除に失敗しました')
    }
  }

  // ルール有効/無効トグル
  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await updateRule(id, { isEnabled })
      await mutate()
    } catch (error) {
      console.error('Failed to toggle rule:', error)
      alert('ルールの切り替えに失敗しました')
    }
  }

  // 全体ON/OFFトグル
  const handleGlobalToggle = async () => {
    const newGlobalEnabled = !globalEnabled
    setGlobalEnabled(newGlobalEnabled)

    // 全ルールの有効/無効を一括更新（単一APIコール）
    try {
      const updates = rules.map(rule => ({
        id: rule.id,
        isEnabled: newGlobalEnabled
      }))
      await bulkUpdateRules(updates)
      await mutate()
    } catch (error) {
      console.error('Failed to toggle global settings:', error)
      alert('全体設定の切り替えに失敗しました')
      setGlobalEnabled(!newGlobalEnabled) // ロールバック
    }
  }

  // フォームを閉じる
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRule(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600 dark:text-red-400">データの取得に失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* フォーム表示エリア */}
      {isFormOpen && (
        <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
          <h2 className="text-base font-semibold mb-4">
            {editingRule ? 'ルールを編集' : '新規ルール追加'}
          </h2>
          <RuleForm
            rule={editingRule ?? undefined}
            onSubmit={editingRule ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            existingRulesCount={rules.length}
          />
        </div>
      )}

      {/* ルール一覧 */}
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">自動返信ルール</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {rules.length}/5件のルールが登録されています
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null)
              setIsFormOpen(true)
            }}
            disabled={rules.length >= 5 || isFormOpen}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            新規ルール追加
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">まだルールが登録されていません</p>
            <p className="text-sm">「新規ルール追加」ボタンから登録してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rules
              .sort((a, b) => b.priority - a.priority)
              .map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
          </div>
        )}
      </div>

      {/* 全体設定 */}
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <h3 className="font-medium mb-4">全体設定</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">自動返信機能</label>
              <p className="text-xs text-muted-foreground">
                全ての自動返信ルールの有効/無効を制御
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={globalEnabled}
                onChange={handleGlobalToggle}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}