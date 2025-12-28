import { Users } from "lucide-react"
import { serverApi, CACHE_STRATEGY } from "@/lib/server-api"
import type { Fan, Pagination } from "@/lib/api-client"

export default async function AudiencePage() {
  // Server Componentでデータフェッチ（ページ1、20件取得）
  const response = await serverApi.GET<{ data: Fan[]; pagination: Pagination }>(
    '/api/v1/audience/fans?page=1&limit=20',
    {
      revalidate: CACHE_STRATEGY.NO_CACHE, // 常に最新データを取得
    }
  )

  // エラーハンドリング
  if (response.error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">オーディエンス管理</h1>
            <p className="text-muted-foreground">友だち一覧の確認とタグ管理</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">
              データの取得に失敗しました: {response.error.message || "時間をおいて再度お試しください。"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // データを取得
  const fans = response.data?.data || []
  const pagination = response.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">オーディエンス管理</h1>
        <p className="text-muted-foreground mt-2">
          友だち一覧の確認とタグ管理ができます
        </p>
      </div>

      {/* 統計情報 */}
      <div className="bg-white rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <div className="text-sm text-muted-foreground">総友だち数</div>
        </div>
        <div className="text-3xl font-bold">{pagination.total.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-2">
          全{pagination.totalPages}ページ
        </p>
      </div>

      {/* 友だち一覧 */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">友だち一覧</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fans.length > 0 ? `${fans.length}件表示中` : 'データがありません'}
          </p>
        </div>
        <div className="p-6">
          {fans.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">まだ友だちがいません</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                LINEアカウントから友だち追加されると、ここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fans.map((fan) => (
                <div
                  key={fan.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition"
                >
                  {fan.pictureUrl ? (
                    <img
                      src={fan.pictureUrl}
                      alt={fan.displayName || 'ユーザー'}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base">{fan.displayName || '名前未設定'}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {fan.tags.length > 0 ? fan.tags.join(', ') : 'タグなし'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(fan.followedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
