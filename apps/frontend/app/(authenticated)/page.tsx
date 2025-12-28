
'use client'
import Link from 'next/link'
import { useDashboardStats, useCampaigns, Campaign } from '@/lib/hooks/use-dashboard'

export default function HomePage() {
  const { stats, isLoading: statsLoading, isError: statsError } = useDashboardStats()
  const { campaigns, isLoading: campaignsLoading, isError: campaignsError } = useCampaigns()

  // ローディング状態
  if (statsLoading || campaignsLoading) {
    return (
      <div className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass dark:glass-dark rounded-lg p-6 shadow-soft animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          ))}
        </div>
        <div className="glass dark:glass-dark rounded-lg shadow-soft p-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // エラー状態
  if (statsError || campaignsError) {
    return (
      <div className="space-y-8">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">データの取得に失敗しました</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">
          LINE公式アカウントの配信状況とパフォーマンスを確認できます
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">主要指標</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">友だち数</p>
            <p className="text-3xl font-bold">{stats?.friendCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">現在の友だち総数</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">今月の送信</p>
            <p className="text-3xl font-bold">{stats?.sendCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">上限: {stats?.sendLimit.toLocaleString()}通</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">平均CTR</p>
            <p className="text-3xl font-bold">{stats?.averageCtr}%</p>
            <p className="text-xs text-muted-foreground mt-2">クリック率（高いほど良好）</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">今月の売上</p>
            <p className="text-3xl font-bold">¥{stats?.monthlyRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">メッセージ経由の売上</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">最近のキャンペーン</h2>
            <p className="text-sm text-muted-foreground">過去の配信結果を確認できます</p>
          </div>
          <Link
            href="/messages"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">キャンペーン名</th>
                <th className="px-6 py-3 text-right font-medium">送信</th>
                <th className="px-6 py-3 text-right font-medium">CTR</th>
                <th className="px-6 py-3 text-right font-medium">CVR</th>
                <th className="px-6 py-3 text-left font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((campaign: Campaign) => (
                <tr key={campaign.id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4">{campaign.name}</td>
                  <td className="px-6 py-4 text-right">{campaign.sentCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{campaign.ctr}%</td>
                  <td className="px-6 py-4 text-right">{campaign.cvr}%</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-500/15 text-green-700 dark:text-green-400' :
                      campaign.status === 'ended' ? 'bg-red-500/15 text-red-700 dark:text-red-400' :
                      'bg-yellow-400/15 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {campaign.status === 'active' ? '配信中' : campaign.status === 'ended' ? '終了' : '一時停止'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
