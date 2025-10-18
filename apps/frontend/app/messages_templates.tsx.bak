import { Plus, Send, Clock, Users } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">メッセージ管理</h1>
          <p className="text-slate-600 dark:text-slate-400">配信用テンプレートやスケジュールの管理</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Plus className="h-4 w-4" />
          新規メッセージ
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">配信済み</div>
            <Send className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">今月</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">配信予定</div>
            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">スケジュール済み</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">総リーチ</div>
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">12,340</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">アクティブユーザー</p>
        </div>
      </div>

      {/* Message Templates */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-white/30 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-semibold">メッセージテンプレート</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">よく使用されるメッセージの一覧</p>
          </div>
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition text-sm">テンプレート追加</button>
        </div>
        <div className="pt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <h3 className="font-semibold mb-2">新商品告知</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">新しい商品やサービスの告知用テンプレート</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">編集</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">複製</button>
              </div>
            </div>

            <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <h3 className="font-semibold mb-2">イベント招待</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ライブやイベントの招待メッセージ</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">編集</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">複製</button>
              </div>
            </div>

            <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <h3 className="font-semibold mb-2">セール通知</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">期間限定セールやキャンペーンの告知</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">編集</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">複製</button>
              </div>
            </div>

            <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <h3 className="font-semibold mb-2">感謝メッセージ</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ファンへの感謝や特別なお知らせ</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">編集</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">複製</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">配信履歴</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">最近配信されたメッセージ</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
            <div className="space-y-1">
              <p className="font-medium">夏のセール開始のお知らせ</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">2024年7月15日 10:00配信</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">配信数: 12,340</span>
              <span className="px-2 py-1 rounded-full text-xs bg-green-500/15 text-green-700">配信完了</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
            <div className="space-y-1">
              <p className="font-medium">新スタンプリリース</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">2024年7月12日 14:30配信</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">配信数: 11,890</span>
              <span className="px-2 py-1 rounded-full text-xs bg-green-500/15 text-green-700">配信完了</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
            <div className="space-y-1">
              <p className="font-medium">限定ライブ配信告知</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">配信予定: 2024年7月20日 18:00</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">対象: 8,500人</span>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-500/15 text-blue-700">配信予定</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
