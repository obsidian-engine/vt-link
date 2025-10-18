import useSWR from 'swr';
import { makeClient } from '../client.js';
const client = makeClient();
export function useCampaigns(page = 1, limit = 20) {
    return useSWR(['/api/v1/campaigns', 'listCampaigns', page, limit], async () => {
        const res = await client.GET('/api/v1/campaigns', {
            params: {
                query: { page, limit }
            }
        });
        if (res.error)
            throw res.error;
        return res.data;
    });
}
export function useCampaign(id) {
    return useSWR(id ? ['/api/v1/campaigns/{id}', 'getCampaign', id] : null, async () => {
        const res = await client.GET('/api/v1/campaigns/{id}', {
            params: { path: { id } }
        });
        if (res.error)
            throw res.error;
        return res.data;
    });
}
export async function createCampaign(input) {
    const res = await client.POST('/api/v1/campaigns', { body: input });
    if (res.error)
        throw res.error;
    return res.data;
}
export async function updateCampaign(id, input) {
    const res = await client.PUT('/api/v1/campaigns/{id}', {
        params: { path: { id } },
        body: input
    });
    if (res.error)
        throw res.error;
    return res.data;
}
export async function deleteCampaign(id) {
    const res = await client.DELETE('/api/v1/campaigns/{id}', {
        params: { path: { id } }
    });
    if (res.error)
        throw res.error;
    return res.data;
}
