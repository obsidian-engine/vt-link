import createClient from 'openapi-fetch';
const BASE_URL = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
    : process.env.API_BASE || 'http://localhost:8080';
export function makeClient(options) {
    return createClient({
        baseUrl: options?.baseUrl || BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.accessToken && {
                Authorization: `Bearer ${options.accessToken}`
            }),
        },
    });
}
