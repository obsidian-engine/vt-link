"use client"
import { Save, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とプリファレンスの管理
        </p>
      </div>

      {/* Profile Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">プロフィール設定</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">LINEアカウントの基本情報</p>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm">表示名</label>
              <input id="displayName" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="チャンネル名" defaultValue="サンプルチャンネル" />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="block text-sm">タイムゾーン</label>
              <select id="timezone" defaultValue="asia-tokyo" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="asia-tokyo">Asia/Tokyo (UTC+9)</option>
                <option value="utc">UTC</option>
                <option value="america-new-york">America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm">プロフィール説明</label>
            <textarea id="description" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="アカウントの説明を入力..." defaultValue="ゲーム配信やイベント情報をお届けします！" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm">プロフィール画像</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                SA
              </div>
              <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                画像をアップロード
              </button>
            </div>
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
              <span className="block text-sm">配信完了通知</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                メッセージ配信が完了したときに通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
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
              <input type="checkbox" defaultChecked className="sr-only peer" />
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
              <input type="checkbox" className="sr-only peer" />
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
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
            </label>
          </div>
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
            <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition text-sm">設定</button>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">API設定</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">LINE Messaging APIの設定</p>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="channelId" className="block text-sm">チャンネルID</label>
            <input id="channelId" className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="1234567890" defaultValue="1234567890" />
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
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition">
          <Save className="h-4 w-4" />
          設定を保存
        </button>
      </div>
    </div>
  )
}
