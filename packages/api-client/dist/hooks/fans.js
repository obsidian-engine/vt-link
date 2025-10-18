import useSWR from 'swr';
import { makeClient } from '../client.js';
const client = makeClient();
export function useFans(page = 1, limit = 20) {
    return useSWR(['/api/v1/fans', 'listFans', page, limit], async () => {
        const res = await client.GET('/api/v1/fans', {
            params: {
                query: { page, limit }
            }
        });
        // @ts-ignore - OpenAPI generated types issue
        if (res.error)
            throw res.error;
        return res.data;
    });
}
export function useFan(id) {
    return useSWR(id ? ['/api/v1/fans/{id}', 'getFan', id] : null, async () => {
        const res = await client.GET('/api/v1/fans/{id}', {
            params: { path: { id } }
        });
        // @ts-ignore - OpenAPI generated types issue
        if (res.error)
            throw res.error;
        return res.data;
    });
}
