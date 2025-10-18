import useSWR from 'swr';
import { makeClient } from '../client.js';
const client = makeClient();
export function useMessages(page = 1, limit = 20) {
    return useSWR(['/api/v1/messages', 'listMessages', page, limit], async () => {
        const res = await client.GET('/api/v1/messages', {
            params: {
                query: { page, limit }
            }
        });
        if (res.error)
            throw res.error;
        return res.data;
    });
}
export function useMessage(id) {
    return useSWR(id ? ['/api/v1/messages/{id}', 'getMessage', id] : null, async () => {
        const res = await client.GET('/api/v1/messages/{id}', {
            params: { path: { id } }
        });
        if (res.error)
            throw res.error;
        return res.data;
    });
}
export async function createMessage(input) {
    const res = await client.POST('/api/v1/messages', { body: input });
    if (res.error)
        throw res.error;
    return res.data;
}
export async function updateMessage(id, input) {
    const res = await client.PUT('/api/v1/messages/{id}', {
        params: { path: { id } },
        body: input
    });
    if (res.error)
        throw res.error;
    return res.data;
}
export async function deleteMessage(id) {
    const res = await client.DELETE('/api/v1/messages/{id}', {
        params: { path: { id } }
    });
    if (res.error)
        throw res.error;
    return res.data;
}
