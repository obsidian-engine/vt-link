export declare function useFans(page?: number, limit?: number): import("swr").SWRResponse<{
    ok: boolean;
    data: {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        isBlocked: boolean;
        tags: string[];
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}, any, any>;
export declare function useFan(id: string): import("swr").SWRResponse<{
    ok: boolean;
    data: {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        isBlocked: boolean;
        tags: string[];
    };
}, any, any>;
