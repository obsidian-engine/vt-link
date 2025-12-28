"use client"
import { Users } from "lucide-react"
import { useFans } from "@/lib/hooks/use-fans"

export default function AudiencePage() {
  const { fans, pagination, isLoading, isError } = useFans(1, 20)

  // エラー状態
  if (isError) {
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
            <p className="text-destructive mb-4">データの取得に失敗しました</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">オーディエンス管理</h1>
            <p className="text-muted-foreground">友だち一覧の確認とタグ管理</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
