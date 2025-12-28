import type { paths } from './__generated__/types.js';
export declare function makeClient(options?: {
    accessToken?: string;
    baseUrl?: string;
}): import("openapi-fetch").Client<paths, `${string}/${string}`>;
export type ApiClient = ReturnType<typeof makeClient>;
export type { paths } from './__generated__/types.js';
