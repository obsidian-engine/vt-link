import { makeClient, type Message } from './api-client'

const client = makeClient()

export type CreateMessageInput = {
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
  status?: 'draft' | 'scheduled' | 'sent'
}

export async function createMessage(input: CreateMessageInput) {
  const res = await client.POST<Message>('/api/v1/messages', { body: input })
  if (res.error) throw res.error
  return res
}

export async function getMessages() {
  const res = await client.GET<Message[]>('/api/v1/messages')
  if (res.error) throw res.error
  return res
}

export async function getMessage(id: string) {
  const res = await client.GET<Message>('/api/v1/messages/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res
}

export async function updateMessage(id: string, input: Partial<CreateMessageInput>) {
  const res = await client.PUT<Message>('/api/v1/messages/{id}', {
    params: { path: { id } },
    body: input
  })
  if (res.error) throw res.error
  return res
}

export async function deleteMessage(id: string) {
  const res = await client.DELETE<Message>('/api/v1/messages/{id}', {
    params: { path: { id } }
  })
  if (res.error) throw res.error
  return res
}