"use client"
import { Users, UserPlus, Target, TrendingUp } from "lucide-react"

export default function AudiencePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">オーディエンス管理</h1>
          <p className="text-muted-foreground">
            セグメント作成、タグ付け、属性管理
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <UserPlus className="h-4 w-4" />
          セグメント作成
        </button>
      </div>

      {/* Audience Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">総友だち数</div>
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
        <div className="text-2xl font-bold">12,340</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">+180 今月</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">アクティブユーザー</div>
            <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">8,920</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">72.3% 全体の</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">セグメント数</div>
            <Target className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">8個 アクティブ</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">新規登録</div>
            <UserPlus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">今日</p>
        </div>
      </div>

      {/* Segments */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-white/30 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-semibold">オーディエンスセグメント</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">ターゲット別のオーディエンス管理</p>
          </div>
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition text-sm">セグメント編集</button>
        </div>
        <div className="pt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">VIPファン</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">1,234人</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                高エンゲージメント・購入履歴あり
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
              </div>
            </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">新規ファン</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">3,456人</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  登録30日以内の新しいファン
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                  <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">ライブ参加者</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">2,890人</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  過去3ヶ月のライブ参加履歴あり
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                  <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">休眠ユーザー</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">1,567人</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  30日以上アクティビティなし
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                  <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">復帰策</button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">グッズ購入者</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">890人</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  過去6ヶ月のグッズ購入履歴
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                  <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">全体</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">12,340人</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  すべてのLINE友だち
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                  <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
