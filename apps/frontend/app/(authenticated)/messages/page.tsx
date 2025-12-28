'use client'
import { useMessages } from './_hooks/useMessages'
import { type Message } from '@/lib/api-client'
import Link from 'next/link'

export default function MessagesPage() {
  const { messages, error, isLoading, mutate } = useMessages()

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

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive">エラー: {String(error)}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-border">
          {messages?.length ? (
            <ul className="divide-y divide-border">
              {messages.map((message: Message) => (
                <li key={message.id} className="p-6 hover:bg-muted/30 transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{message.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          message.status === 'sent' ? 'bg-green-100 text-green-800' :
                          message.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {message.status === 'sent' ? '配信済' :
                           message.status === 'scheduled' ? '配信予定' : '下書き'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.body}</p>
                      {message.scheduledAt && (
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          配信予定: {new Date(message.scheduledAt).toLocaleString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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