"use client"
import { Users, UserPlus } from "lucide-react"
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
            <p className="text-slate-600 dark:text-slate-400">セグメント作成、タグ付け、属性管理</p>
          </div>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">データの取得に失敗しました</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
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
            <p className="text-slate-600 dark:text-slate-400">セグメント作成、タグ付け、属性管理</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass dark:glass-dark rounded-lg p-6 shadow-soft animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">総友だち数</div>
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">{pagination.total.toLocaleString()}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            全{pagination.totalPages}ページ
          </p>
        </div>
      </div>

      {/* ファン一覧プレビュー */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-white/30 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-semibold">最近のファン</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fans.length > 0 ? `${fans.length}件表示中` : 'データがありません'}
            </p>
          </div>
        </div>
        <div className="pt-4">
          {fans.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">
              まだファンが登録されていません
            </p>
          ) : (
            <div className="space-y-2">
              {fans.slice(0, 5).map((fan) => (
                <div 
                  key={fan.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-white/30 bg-white/30 hover:bg-white/40 transition-colors"
                >
                  {fan.pictureUrl ? (
                    <img 
                      src={fan.pictureUrl} 
                      alt={fan.displayName || 'ユーザー'} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{fan.displayName || '名前未設定'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {fan.tags.length > 0 ? fan.tags.join(', ') : 'タグなし'}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
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
