import type { CreateMessageRequest, UpdateMessageRequest } from '@vt-link/schema-zod';
export declare function useMessages(page?: number, limit?: number): import("swr").SWRResponse<{
    ok: boolean;
    data: {
        id: string;
        title: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        status: "draft" | "scheduled" | "sent" | "failed";
        createdAt: string;
        updatedAt: string;
    }[];
}, any, any>;
export declare function useMessage(id: string): import("swr").SWRResponse<{
    ok: boolean;
    data: {
        id: string;
        title: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        status: "draft" | "scheduled" | "sent" | "failed";
        createdAt: string;
        updatedAt: string;
    };
}, any, any>;
export declare function createMessage(input: CreateMessageRequest): Promise<{
    ok: boolean;
    data: {
        id: string;
        title: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        status: "draft" | "scheduled" | "sent" | "failed";
        createdAt: string;
        updatedAt: string;
    };
}>;
export declare function updateMessage(id: string, input: UpdateMessageRequest): Promise<{
    ok: boolean;
    data: {
        id: string;
        title: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        status: "draft" | "scheduled" | "sent" | "failed";
        createdAt: string;
        updatedAt: string;
    };
}>;
export declare function deleteMessage(id: string): Promise<{
    ok: true;
    message?: string;
}>;
