// VT-Line API Client Mock
// 実際のAPI client実装までの暫定的なモック

export interface Message {
  id: string
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
  status: 'draft' | 'scheduled' | 'sent'
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    status: number
  }
}

export interface ApiClient {
  GET<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> } }): Promise<ApiResponse<T>>
  POST<T = unknown>(path: string, options?: { body?: unknown }): Promise<ApiResponse<T>>
  PUT<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> }; body?: unknown }): Promise<ApiResponse<T>>
  DELETE<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> } }): Promise<ApiResponse<T>>
}

// モック実装
const mockMessages: Message[] = [
  {
    id: '1',
    title: 'サンプルメッセージ1',
    body: 'これはテスト用のメッセージです。',
    status: 'draft',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'サンプルメッセージ2',
    body: '配信予定のメッセージです。',
    status: 'scheduled',
    scheduledAt: '2024-01-20T14:00:00Z',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  }
]

const createApiClient = (): ApiClient => ({
  async GET<T>(path: string): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay

    if (path === '/api/v1/messages') {
      return { data: mockMessages as T }
    }

    const messageIdMatch = path.match(/\/api\/v1\/messages\/(.+)/)
    if (messageIdMatch) {
      const message = mockMessages.find(c => c.id === messageIdMatch[1])
      if (message) {
        return { data: message as T }
      }
      return { error: { message: 'Message not found', status: 404 } }
    }

    return { error: { message: 'Not found', status: 404 } }
  },

  async POST<T>(path: string, options?: { body?: unknown }): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200))

    if (path === '/api/v1/messages' && options?.body) {
      const newMessage: Message = {
        ...(options.body as Omit<Message, 'id' | 'createdAt' | 'updatedAt'>),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockMessages.push(newMessage)
      return { data: newMessage as T }
    }

    return { error: { message: 'Bad request', status: 400 } }
  },

  async PUT<T>(path: string, options?: { params?: { path?: Record<string, string> }; body?: unknown }): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const messageIdMatch = path.match(/\/api\/v1\/messages\/(.+)/)
    if (messageIdMatch && options?.body) {
      const messageIndex = mockMessages.findIndex(c => c.id === messageIdMatch[1])
      if (messageIndex >= 0) {
        mockMessages[messageIndex] = {
          ...mockMessages[messageIndex],
          ...(options.body as Partial<Message>),
          updatedAt: new Date().toISOString()
        }
        return { data: mockMessages[messageIndex] as T }
      }
      return { error: { message: 'Message not found', status: 404 } }
    }

    return { error: { message: 'Bad request', status: 400 } }
  },

  async DELETE<T>(path: string): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 150))

    const messageIdMatch = path.match(/\/api\/v1\/messages\/(.+)/)
    if (messageIdMatch) {
      const messageIndex = mockMessages.findIndex(c => c.id === messageIdMatch[1])
      if (messageIndex >= 0) {
        const deletedMessage = mockMessages.splice(messageIndex, 1)[0]
        return { data: deletedMessage as T }
      }
      return { error: { message: 'Message not found', status: 404 } }
    }

    return { error: { message: 'Bad request', status: 400 } }
  }
})

export function makeClient(): ApiClient {
  return createApiClient()
}