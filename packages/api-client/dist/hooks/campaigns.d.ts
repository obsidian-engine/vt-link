import type { CreateCampaignRequest, UpdateCampaignRequest } from '@vt-link/schema-zod';
export declare function useCampaigns(page?: number, limit?: number): any;
export declare function useCampaign(id: string): any;
export declare function createCampaign(input: CreateCampaignRequest): Promise<{
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
export declare function updateCampaign(id: string, input: UpdateCampaignRequest): Promise<{
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
export declare function deleteCampaign(id: string): Promise<{
    ok: true;
    message?: string;
}>;
