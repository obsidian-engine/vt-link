'use client'

import type { Message } from '@/lib/api-client'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ul className="divide-y divide-border">
      {messages.map((message) => (
        <li key={message.id} className="p-6 hover:bg-muted/30 transition">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{message.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    message.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : message.status === 'scheduled'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.status === 'sent'
                    ? '配信済'
                    : message.status === 'scheduled'
                    ? '配信予定'
                    : '下書き'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {message.body}
              </p>
              {message.scheduledAt && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  配信予定: {new Date(message.scheduledAt).toLocaleString('ja-JP')}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
