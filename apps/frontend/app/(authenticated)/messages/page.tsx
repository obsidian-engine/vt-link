import { serverApi, CACHE_STRATEGY } from '@/lib/server-api'
import type { Message } from '@/lib/api-client'
import Link from 'next/link'
import { MessageList } from './_components/message-list'

// Force dynamic rendering for cookie access
export const dynamic = 'force-dynamic'

interface MessagesResponse {
  data: Message[]
}

export default async function MessagesPage() {
  // Server Componentでデータ取得
  const result = await serverApi.GET<MessagesResponse>('/api/v1/messages', {
    revalidate: CACHE_STRATEGY.SHORT, // 60秒間キャッシュ
  })

  // エラーハンドリング
  if (result.error) {
    return (
      <main className="space-y-6 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-sm text-destructive">
              エラー: {result.error.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const messages = result.data?.data ?? []

  return (
    <main className="space-y-6 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">メッセージ配信</h1>
            <p className="text-muted-foreground mt-2">
              友だちにメッセージを送信・予約できます
            </p>
          </div>
          <Link
            href="/messages/new"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            <span>+ 新規メッセージ</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-border">
          {messages.length > 0 ? (
            <MessageList messages={messages} />
          ) : (
            <div className="p-16 text-center">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold">まだメッセージがありません</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                友だちに送信するメッセージを作成しましょう
              </p>
              <Link
                href="/messages/new"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
              >
                + 最初のメッセージを作成
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
