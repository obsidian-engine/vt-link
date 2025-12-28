import { serverApi, CACHE_STRATEGY } from '@/lib/server-api'
import { RichMenuClient } from './_components/richmenu-client'
import type { RichMenu } from '@/lib/api-client'

export default async function RichMenuPage() {
  const { data, error } = await serverApi.GET<RichMenu[]>('/richmenu', {
    revalidate: CACHE_STRATEGY.SHORT
  })

  if (error) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">リッチメニュー管理</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">エラー: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">リッチメニュー管理</h1>
      </div>

      <RichMenuClient initialRichMenus={data || []} />
    </div>
  )
}
