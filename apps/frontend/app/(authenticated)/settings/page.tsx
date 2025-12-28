import { AlertCircle } from "lucide-react"
import { serverApi, CACHE_STRATEGY } from "@/lib/server-api"
import { SettingsForm } from "./SettingsForm"
import type { UserSettings } from "@/lib/api-client"

// Force dynamic rendering for cookie access
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  // Server Componentでデータフェッチ
  const response = await serverApi.GET<{ data: UserSettings }>('/api/v1/settings', {
    revalidate: CACHE_STRATEGY.NO_CACHE, // 常に最新データを取得
  })

  // エラーハンドリング
  if (response.error) {
    return (
      <div className="max-w-4xl">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">設定の読み込みに失敗しました</p>
              <p className="text-sm mt-1">
                {response.error.message || "時間をおいて再度お試しください。"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // データを取得
  const settings = response.data?.data || null

  return <SettingsForm initialSettings={settings} />
}
