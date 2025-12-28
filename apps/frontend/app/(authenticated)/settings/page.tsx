"use client"
import { Save, Upload, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useSettings, updateSettings } from "./_hooks/use-settings"

export default function SettingsPage() {
  // API接続（バックエンドAPIに存在するフィールド）
  const { settings, isLoading, isError, mutate } = useSettings()

  // フォーム状態管理
  const [timezone, setTimezone] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [defaultReplyDelay, setDefaultReplyDelay] = useState<number>(0)
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(true)

  // ローカル状態（バックエンドAPIに未対応のフィールド）
  const [displayName, setDisplayName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [deliveryNotification, setDeliveryNotification] = useState<boolean>(true)
  const [errorNotification, setErrorNotification] = useState<boolean>(true)
  const [weeklyReport, setWeeklyReport] = useState<boolean>(false)
  const [featureNotification, setFeatureNotification] = useState<boolean>(true)

  // 保存状態
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string>("")
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // APIデータからフォームを初期化
  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone || "asia-tokyo")
      setLanguage(settings.language || "ja")
      setDefaultReplyDelay(settings.defaultReplyDelay || 0)
      setNotificationEnabled(settings.notificationEnabled ?? true)
    }
  }, [settings])

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      // API対応フィールドのみ送信
      await updateSettings({
        timezone,
        language,
        defaultReplyDelay,
        notificationEnabled,
      })

      // データを再取得
      await mutate()
      setSaveSuccess(true)

      // 成功メッセージを3秒後に消す
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // エラー状態
  if (isError) {
    return (
      <div className="max-w-4xl">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>設定の読み込みに失敗しました。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とプリファレンスの管理
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="glass dark:glass-dark rounded-lg p-4 shadow-soft border-l-4 border-green-500">
          <p className="text-sm text-green-600 dark:text-green-400">
            設定を保存しました
          </p>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="glass dark:glass-dark rounded-lg p-4 shadow-soft border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">プロフィール設定</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">LINEアカウントの基本情報</p>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm">表示名</label>
              <input
                id="displayName"
                className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="チャンネル名"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">※ バックエンドAPI未対応（ローカル管理）</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="block text-sm">タイムゾーン</label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="asia-tokyo">Asia/Tokyo (UTC+9)</option>
                <option value="utc">UTC</option>
                <option value="america-new-york">America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm">言語</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm">プロフィール説明</label>
            <textarea
              id="description"
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="アカウントの説明を入力..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">※ バックエンドAPI未対応（ローカル管理）</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm">プロフィール画像</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {displayName.substring(0, 2).toUpperCase() || "SA"}
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                画像をアップロード
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">※ バックエンドAPI未対応</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">通知設定</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">配信やシステムの通知設定</p>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">通知を有効化</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                全体の通知設定（API連携）
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationEnabled}
                onChange={(e) => setNotificationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">配信完了通知</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                メッセージ配信が完了したときに通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryNotification}
                onChange={(e) => setDeliveryNotification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">エラー通知</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                配信エラーやシステムエラーが発生したときに通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={errorNotification}
                onChange={(e) => setErrorNotification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">週次レポート</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                毎週の配信統計レポートをメールで受信
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyReport}
                onChange={(e) => setWeeklyReport(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">新機能の通知</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                新機能やアップデート情報を受信
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featureNotification}
                onChange={(e) => setFeatureNotification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            ※ 「通知を有効化」以外はバックエンドAPI未対応（ローカル管理）
          </p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">セキュリティ</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">アカウントのセキュリティ設定</p>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm">現在のパスワード</label>
            <input id="currentPassword" type="password" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm">新しいパスワード</label>
              <input id="newPassword" type="password" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm">パスワード確認</label>
              <input id="confirmPassword" type="password" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-sm">二段階認証</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                SMS認証でアカウントセキュリティを強化
              </p>
            </div>
            <button type="button" className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition text-sm">設定</button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">※ バックエンドAPI未対応</p>
        </div>
      </div>

      {/* API Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">API設定</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">LINE Messaging APIの設定</p>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="channelId" className="block text-sm">チャンネルID</label>
            <input id="channelId" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="1234567890" />
          </div>

          <div className="space-y-2">
            <label htmlFor="channelSecret" className="block text-sm">チャンネルシークレット</label>
            <input id="channelSecret" type="password" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="••••••••••••••••" />
          </div>

          <div className="space-y-2">
            <label htmlFor="accessToken" className="block text-sm">アクセストークン</label>
            <input id="accessToken" type="password" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="••••••••••••••••" />
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> APIキーは安全に管理してください。第三者と共有しないでください。
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">※ バックエンドAPI未対応</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              設定を保存
            </>
          )}
        </button>
      </div>
    </form>
  )
}
