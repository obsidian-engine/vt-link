import { serverApi, CACHE_STRATEGY } from '@/lib/server-api'
import type { AutoReplyRule } from '@/lib/api-client'
import { AutoReplyClient } from './_components/autoreply-client'

interface AutoReplyRulesResponse {
  data: AutoReplyRule[]
}

export default async function AutoReplyPage() {
  // Server Componentでデータ取得
  const result = await serverApi.GET<AutoReplyRulesResponse>('/api/v1/autoreply/rules', {
    revalidate: CACHE_STRATEGY.NO_CACHE, // 常に最新データを取得
  })

  // エラーハンドリング
  if (result.error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-900/20 p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600 dark:text-red-400">
              データの取得に失敗しました: {result.error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const rules = result.data?.data ?? []

  return <AutoReplyClient initialRules={rules} />
}
