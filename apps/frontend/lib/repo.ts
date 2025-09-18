import { makeClient, type Campaign } from './api-client'

const client = makeClient()

export type CreateCampaignInput = {
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
  status?: 'draft' | 'scheduled' | 'sent'
}

export async function createCampaign(input: CreateCampaignInput) {
  const res = await client.POST<Campaign>('/api/v1/campaigns', { body: input })
  if (res.error) throw res.error
  return res
}

export async function getCampaigns() {
  const res = await client.GET<Campaign[]>('/api/v1/campaigns')
  if (res.error) throw res.error
  return res
}

export async function getCampaign(id: string) {
  const res = await client.GET<Campaign>('/api/v1/campaigns/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res
}

export async function updateCampaign(id: string, input: Partial<CreateCampaignInput>) {
  const res = await client.PUT<Campaign>('/api/v1/campaigns/{id}', {
    params: { path: { id } },
    body: input
  })
  if (res.error) throw res.error
  return res
}

export async function deleteCampaign(id: string) {
  const res = await client.DELETE<Campaign>('/api/v1/campaigns/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res
}