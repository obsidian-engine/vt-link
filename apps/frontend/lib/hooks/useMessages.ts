'use client'
import useSWR from 'swr'
import { getMessages, createMessage, type CreateMessageInput } from '../repo'
import { type Message, type ApiResponse } from '../api-client'

export function useMessages() {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/v1/messages', 'listMessages'],
    getMessages
  )

  return {
    messages: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useCreateMessage() {
  const { mutate } = useMessages()

  const create = async (input: CreateMessageInput) => {
    const result = await createMessage(input)

    // Optimistic update
    await mutate(async (current: ApiResponse<Message[]> | undefined) => {
      if (!current || !result.data) return current
      return {
        ...current,
        data: [result.data, ...(current.data || [])]
      }
    }, { revalidate: false })

    return result
  }

  return { create }
}