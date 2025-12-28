import Link from 'next/link'
import { serverApi, CACHE_STRATEGY } from '@/lib/server-api'

// Force dynamic rendering for cookie access
export const dynamic = 'force-dynamic'

interface DashboardStats {
  friendCount: number
  sendCount: number
  sendLimit: number
  averageCtr: number
  monthlyRevenue: number
}

interface Campaign {
  id: string
  name: string
  sentCount: number
  ctr: number
  cvr: number
  status: 'active' | 'ended' | 'paused'
  createdAt: string
}

interface DashboardStatsResponse {
  data: DashboardStats
}

interface CampaignsResponse {
  data: Campaign[]
}

/**
 * エラーからメッセージを安全に取得する型ガード関数
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '不明なエラー'
}

export default async function HomePage() {
  // 並列でデータ取得
  const [statsResult, campaignsResult] = await Promise.all([
    serverApi.GET<DashboardStatsResponse>('/api/v1/dashboard/stats', {
      revalidate: CACHE_STRATEGY.SHORT, // 60秒間キャッシュ
    }),
    serverApi.GET<CampaignsResponse>('/api/v1/campaigns', {
      revalidate: CACHE_STRATEGY.SHORT,
    }),
  ])

  // エラー状態
  if (statsResult.error || campaignsResult.error) {
    const errorMessage = 
      getErrorMessage(statsResult.error) || 
      getErrorMessage(campaignsResult.error) || 
      '不明なエラー'
    const isNetworkError = 
      errorMessage.toLowerCase().includes('network') || 
      errorMessage.toLowerCase().includes('fetch')

    return (
      <div className="space-y-8">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="text-center py-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              データの取得に失敗しました
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isNetworkError
                ? 'ネットワーク接続を確認してください。インターネット接続が不安定な可能性があります。'
                : 'サーバーとの通信に問題が発生しました。しばらく経ってから再度お試しください。'}
            </p>
            <details className="text-left mb-6 max-w-md mx-auto">
              <summary className="text-xs text-gray-500 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                エラー詳細を表示
              </summary>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono break-all">
                {errorMessage}
              </p>
            </details>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="min-h-[44px] px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
              >
                再読み込み
              </Link>
              <Link
                href="/settings"
                className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 transition"
              >
                設定を確認
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              問題が解決しない場合は、
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                サポートにお問い合わせ
              </a>
              ください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const stats = statsResult.data?.data
  const campaigns = campaignsResult.data?.data ?? []

  if (!stats) {
    return (
      <div className="space-y-8">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <p className="text-center text-muted-foreground">
            データが見つかりませんでした
          </p>
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
            <p className="text-3xl font-bold">{stats.friendCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">現在の友だち総数</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">今月の送信</p>
            <p className="text-3xl font-bold">{stats.sendCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">
              上限: {stats.sendLimit.toLocaleString()}通
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">平均CTR</p>
            <p className="text-3xl font-bold">{stats.averageCtr}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              クリック率（高いほど良好）
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-border hover:border-primary/50 transition">
            <p className="text-sm text-muted-foreground mb-1">今月の売上</p>
            <p className="text-3xl font-bold">
              ¥{stats.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              メッセージ経由の売上
            </p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">最近のキャンペーン</h2>
            <p className="text-sm text-muted-foreground">
              過去の配信結果を確認できます
            </p>
          </div>
          <Link
            href="/messages"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {campaigns.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    キャンペーン名
                  </th>
                  <th className="px-6 py-3 text-right font-medium">送信</th>
                  <th className="px-6 py-3 text-right font-medium">CTR</th>
                  <th className="px-6 py-3 text-right font-medium">CVR</th>
                  <th className="px-6 py-3 text-left font-medium">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4">{campaign.name}</td>
                    <td className="px-6 py-4 text-right">
                      {campaign.sentCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">{campaign.ctr}%</td>
                    <td className="px-6 py-4 text-right">{campaign.cvr}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                            : campaign.status === 'ended'
                            ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                            : 'bg-yellow-400/15 text-yellow-700 dark:text-yellow-300'
                        }`}
                      >
                        {campaign.status === 'active'
                          ? '配信中'
                          : campaign.status === 'ended'
                          ? '終了'
                          : '一時停止'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>まだキャンペーンがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
