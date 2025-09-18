// VT-Line API Client Mock
// 実際のAPI client実装までの暫定的なモック

export interface Campaign {
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
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'サンプルキャンペーン1',
    body: 'これはテスト用のキャンペーンメッセージです。',
    status: 'draft',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'サンプルキャンペーン2',
    body: '配信予定のキャンペーンです。',
    status: 'scheduled',
    scheduledAt: '2024-01-20T14:00:00Z',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  }
]

const createApiClient = (): ApiClient => ({
  async GET<T>(path: string): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay

    if (path === '/api/v1/campaigns') {
      return { data: mockCampaigns as T }
    }

    const campaignIdMatch = path.match(/\/api\/v1\/campaigns\/(.+)/)
    if (campaignIdMatch) {
      const campaign = mockCampaigns.find(c => c.id === campaignIdMatch[1])
      if (campaign) {
        return { data: campaign as T }
      }
      return { error: { message: 'Campaign not found', status: 404 } }
    }

    return { error: { message: 'Not found', status: 404 } }
  },

  async POST<T>(path: string, options?: { body?: unknown }): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200))

    if (path === '/api/v1/campaigns' && options?.body) {
      const newCampaign: Campaign = {
        ...(options.body as Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockCampaigns.push(newCampaign)
      return { data: newCampaign as T }
    }

    return { error: { message: 'Bad request', status: 400 } }
  },

  async PUT<T>(path: string, options?: { params?: { path?: Record<string, string> }; body?: unknown }): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const campaignIdMatch = path.match(/\/api\/v1\/campaigns\/(.+)/)
    if (campaignIdMatch && options?.body) {
      const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignIdMatch[1])
      if (campaignIndex >= 0) {
        mockCampaigns[campaignIndex] = {
          ...mockCampaigns[campaignIndex],
          ...(options.body as Partial<Campaign>),
          updatedAt: new Date().toISOString()
        }
        return { data: mockCampaigns[campaignIndex] as T }
      }
      return { error: { message: 'Campaign not found', status: 404 } }
    }

    return { error: { message: 'Bad request', status: 400 } }
  },

  async DELETE<T>(path: string): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 150))

    const campaignIdMatch = path.match(/\/api\/v1\/campaigns\/(.+)/)
    if (campaignIdMatch) {
      const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignIdMatch[1])
      if (campaignIndex >= 0) {
        const deletedCampaign = mockCampaigns.splice(campaignIndex, 1)[0]
        return { data: deletedCampaign as T }
      }
      return { error: { message: 'Campaign not found', status: 404 } }
    }

    return { error: { message: 'Bad request', status: 400 } }
  }
})

export function makeClient(): ApiClient {
  return createApiClient()
}