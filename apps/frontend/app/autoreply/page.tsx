export default function AutoReplyPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">自動返信設定</h2>
          <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
            新規ルール追加
          </button>
        </div>
        <p className="text-muted-foreground mb-6">
          キーワード応答、営業時間内応答、ウェルカムメッセージなどを設定します。
        </p>

        {/* Auto Reply Rules */}
        <div className="space-y-4">
          <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-medium">営業時間外メッセージ</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  編集
                </button>
                <button className="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                  無効化
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              営業時間外（18:00-9:00）に受信したメッセージに自動返信
            </p>
            <div className="text-xs bg-muted/50 rounded p-2">
              「お疲れ様です！営業時間外のため、翌営業日にお返事いたします。」
            </div>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-medium">キーワード応答: 「料金」</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  編集
                </button>
                <button className="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                  無効化
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              「料金」「価格」「値段」などのキーワードに反応
            </p>
            <div className="text-xs bg-muted/50 rounded p-2">
              「料金についてのお問い合わせですね。詳細は以下のリンクをご確認ください。」
            </div>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/40 dark:bg-slate-800/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h3 className="font-medium">ウェルカムメッセージ</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  編集
                </button>
                <button className="text-xs px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                  無効化
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              新規友だち追加時に送信される初回メッセージ
            </p>
            <div className="text-xs bg-muted/50 rounded p-2">
              「友だち追加ありがとうございます！最新情報をお届けします。」
            </div>
          </div>
        </div>
      </div>

      {/* Auto Reply Settings */}
      <div className="rounded-lg border border-white/30 bg-white/55 backdrop-blur-md dark:bg-slate-800/35 dark:border-slate-700/60 p-6 shadow-md">
        <h3 className="font-medium mb-4">全体設定</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">自動返信機能</label>
              <p className="text-xs text-muted-foreground">全ての自動返信ルールの有効/無効を制御</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">応答遅延</label>
              <p className="text-xs text-muted-foreground">より自然な応答のための遅延時間</p>
            </div>
            <select className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
              <option>即座に送信</option>
              <option>1秒後</option>
              <option>3秒後</option>
              <option>5秒後</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
              設定を保存
            </button>
            <button className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors">
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}