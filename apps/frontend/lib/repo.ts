import { makeClient } from '@vt/api-client/src/client'

const client = makeClient()

export type CreateCampaignInput = {
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
  status?: 'draft' | 'scheduled' | 'sent'
}

export async function createCampaign(input: CreateCampaignInput) {
  const res = await client.POST('/api/v1/campaigns', { body: input })
  if (res.error) throw res.error
  return res.data
}

export async function getCampaigns() {
  const res = await client.GET('/api/v1/campaigns')
  if (res.error) throw res.error
  return res.data
}

export async function getCampaign(id: string) {
  const res = await client.GET('/api/v1/campaigns/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res.data
}

export async function updateCampaign(id: string, input: Partial<CreateCampaignInput>) {
  const res = await client.PUT('/api/v1/campaigns/{id}', {
    params: { path: { id } },
    body: input
  })
  if (res.error) throw res.error
  return res.data
}

export async function deleteCampaign(id: string) {
  const res = await client.DELETE('/api/v1/campaigns/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res.data
}