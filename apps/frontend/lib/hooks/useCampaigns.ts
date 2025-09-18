'use client'
import useSWR from 'swr'
import { getCampaigns, createCampaign, type CreateCampaignInput } from '../repo'
import { type Campaign, type ApiResponse } from '../api-client'

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/v1/campaigns', 'listCampaigns'],
    getCampaigns
  )

  return {
    campaigns: data?.data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useCreateCampaign() {
  const { mutate } = useCampaigns()

  const create = async (input: CreateCampaignInput) => {
    const result = await createCampaign(input)

    // Optimistic update
    await mutate(async (current: ApiResponse<Campaign[]> | undefined) => {
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