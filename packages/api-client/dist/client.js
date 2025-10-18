import createClient from 'openapi-fetch';
const BASE_URL = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
    : process.env.API_BASE || 'http://localhost:8080';
export function makeClient(baseUrl) {
    return createClient({
        baseUrl: baseUrl || BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
