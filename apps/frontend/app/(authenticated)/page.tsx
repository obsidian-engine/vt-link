
'use client'
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
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">友だち数</p>
          <p className="text-2xl font-bold">{stats?.friendCount.toLocaleString()}</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">今月の送信</p>
          <p className="text-2xl font-bold">{stats?.sendCount.toLocaleString()} / {stats?.sendLimit.toLocaleString()}</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">平均CTR</p>
          <p className="text-2xl font-bold">{stats?.averageCtr}%</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">今月の売上</p>
          <p className="text-2xl font-bold">¥{stats?.monthlyRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass dark:glass-dark rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/30 dark:border-slate-700/60 font-medium flex items-center justify-between">
          <span>最近のキャンペーン</span>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">更新</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/30">
              <tr>
                <th className="px-6 py-3 text-left font-medium">キャンペーン名</th>
                <th className="px-6 py-3 text-right font-medium">送信</th>
                <th className="px-6 py-3 text-right font-medium">CTR</th>
                <th className="px-6 py-3 text-right font-medium">CVR</th>
                <th className="px-6 py-3 text-left font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-slate-700/60">
              {campaigns.map((campaign: Campaign) => (
                <tr key={campaign.id} className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition">
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
