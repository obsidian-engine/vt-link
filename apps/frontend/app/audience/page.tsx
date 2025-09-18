"use client"
import { Users, UserPlus, Target, TrendingUp } from "lucide-react"

export default function AudiencePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">オーディエンス管理</h1>
          <p className="text-slate-600 dark:text-slate-400">セグメント作成、タグ付け、属性管理</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <UserPlus className="h-4 w-4" />
          セグメント作成
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '総友だち数', icon: Users, value: '12,340', sub: '+180 今月' },
          { label: 'アクティブユーザー', icon: TrendingUp, value: '8,920', sub: '72.3% 全体の' },
          { label: 'セグメント数', icon: Target, value: '15', sub: '8個 アクティブ' },
          { label: '新規登録', icon: UserPlus, value: '24', sub: '今日' },
        ].map((s, i) => (
          <div key={i} className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">{s.label}</div>
              <s.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-white/30 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-semibold">オーディエンスセグメント</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">ターゲット別のオーディエンス管理</p>
          </div>
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition text-sm">セグメント編集</button>
        </div>
        <div className="pt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'VIPファン', count: '1,234人', desc: '高エンゲージメント・購入履歴あり' },
            { title: '新規ファン', count: '3,456人', desc: '登録30日以内の新しいファン' },
            { title: 'ライブ参加者', count: '2,890人', desc: '過去3ヶ月のライブ参加履歴あり' },
            { title: '休眠ユーザー', count: '1,567人', desc: '30日以上アクティビティなし' },
            { title: 'グッズ購入者', count: '890人', desc: '過去6ヶ月のグッズ購入履歴' },
            { title: '全体', count: '12,340人', desc: 'すべてのLINE友だち' },
          ].map((seg) => (
            <div key={seg.title} className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{seg.title}</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">{seg.count}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{seg.desc}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border bg-white/60 hover:bg-white/80">詳細</button>
                <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">配信</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
