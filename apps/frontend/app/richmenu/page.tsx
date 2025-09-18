export default function RichMenuPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">リッチメニュー管理</h2>
          <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
            新規作成
          </button>
        </div>
        <p className="text-muted-foreground mb-6">
          リッチメニューの画像アップロード、エリア設定、プレビューなどを管理します。
        </p>

        {/* Rich Menu Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
            <div className="aspect-[3/2] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">メインメニュー画像</span>
            </div>
            <h3 className="font-medium mb-2">メインメニュー</h3>
            <p className="text-xs text-muted-foreground mb-3">6エリア設定済み</p>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                編集
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                プレビュー
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
            <div className="aspect-[3/2] bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">キャンペーン画像</span>
            </div>
            <h3 className="font-medium mb-2">期間限定メニュー</h3>
            <p className="text-xs text-muted-foreground mb-3">4エリア設定済み</p>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                編集
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                プレビュー
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Settings */}
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <h3 className="font-medium mb-4">メニュー設定</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">表示タイプ</label>
            <select className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary">
              <option>固定表示</option>
              <option>条件表示</option>
              <option>期間限定</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">対象ユーザー</label>
            <select className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary">
              <option>全ユーザー</option>
              <option>新規ユーザー</option>
              <option>VIPユーザー</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
              保存
            </button>
            <button className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}