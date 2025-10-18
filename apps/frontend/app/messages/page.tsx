'use client'
import { useMessages } from '../../lib/hooks/useMessages'
import { type Message } from '../../lib/api-client'
import Link from 'next/link'

export default function MessagesPage() {
  const { messages, error, isLoading, mutate } = useMessages()

  return (
    <main className="space-y-6 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">メッセージ配信管理</h1>
          <Link
            href="/messages/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            新規作成
          </Link>
        </div>

        <button
          className="rounded border px-3 py-1.5"
          onClick={() => mutate()}
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>

        {error && (
          <p className="text-red-600">Error: {String(error)}</p>
        )}

        <div className="bg-white rounded-lg border">
          {messages?.length ? (
            <ul className="divide-y">
              {messages.map((message: Message) => (
                <li key={message.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{message.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{message.body}</p>
                      {message.scheduledAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          配信予定: {new Date(message.scheduledAt).toLocaleString('ja-JP')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      message.status === 'sent' ? 'bg-green-100 text-green-800' :
                      message.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status === 'sent' ? '配信済' :
                       message.status === 'scheduled' ? '配信予定' : '下書き'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              メッセージがありません
            </div>
          )}
        </div>
      </div>
    </main>
  )
}