import { Calendar, Download, Filter, Loader2 } from "lucide-react"
import { serverApi, CACHE_STRATEGY } from "@/lib/server-api"
import type { MessageHistory } from "@/lib/api-client"

export default async function HistoryPage() {
  // Server Componentでデータフェッチ
  const response = await serverApi.GET<{ data: MessageHistory[] }>('/api/v1/history', {
    revalidate: CACHE_STRATEGY.NO_CACHE, // 常に最新データを取得
  })

  // エラーハンドリング
  if (response.error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">配信履歴</h1>
            <p className="text-muted-foreground">
              過去の配信・結果を一覧表示
            </p>
          </div>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-400">
              配信履歴の取得に失敗しました。{response.error.message || "時間をおいて再度お試しください。"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // データを取得
  const histories = response.data?.data || []

  // 日時フォーマット関数
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ステータス表示関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
            配信完了
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400">
            配信失敗
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">
            配信待機中
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-700 dark:text-gray-400">
            不明
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">配信履歴</h1>
          <p className="text-muted-foreground">
            過去の配信・結果を一覧表示
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* Summary Stats - 将来のAPI拡張で実装予定 */}
      {/* TODO: サマリーAPIエンドポイント実装後に有効化 */}

      {/* History Table */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">配信履歴詳細</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">配信されたメッセージとその結果</p>
        
        {/* Empty State */}
        {histories.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-400">配信履歴がありません</p>
          </div>
        )}

        {/* Data Table */}
        {histories.length > 0 && (
          <div className="rounded-lg border border-white/30 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/30">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">配信日時</th>
                  <th className="px-6 py-3 text-left font-medium">メッセージID</th>
                  <th className="px-6 py-3 text-right font-medium">配信数</th>
                  <th className="px-6 py-3 text-left font-medium">ステータス</th>
                  <th className="px-6 py-3 text-left font-medium">エラー</th>
                  <th className="px-6 py-3 text-left font-medium">作成日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-slate-700/60">
                {histories.map((history) => (
                  <tr key={history.id} className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4">{formatDate(history.sentAt)}</td>
                    <td className="px-6 py-4 font-mono text-xs">{history.messageId}</td>
                    <td className="px-6 py-4 text-right">{history.recipientCount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(history.status)}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={history.errorMessage || undefined}>
                      {history.errorMessage || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(history.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
