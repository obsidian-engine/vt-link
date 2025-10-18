import { z } from 'zod';
export declare const Fan: z.ZodObject<{
    id: z.ZodString;
    lineUserId: z.ZodString;
    displayName: z.ZodNullable<z.ZodString>;
    pictureUrl: z.ZodNullable<z.ZodString>;
    followedAt: z.ZodString;
    lastInteractionAt: z.ZodNullable<z.ZodString>;
    isBlocked: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    lineUserId: string;
    displayName: string | null;
    pictureUrl: string | null;
    followedAt: string;
    lastInteractionAt: string | null;
    isBlocked: boolean;
    tags: string[];
}, {
    id: string;
    lineUserId: string;
    displayName: string | null;
    pictureUrl: string | null;
    followedAt: string;
    lastInteractionAt: string | null;
    tags: string[];
    isBlocked?: boolean | undefined;
}>;
export declare const FanListResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        lineUserId: z.ZodString;
        displayName: z.ZodNullable<z.ZodString>;
        pictureUrl: z.ZodNullable<z.ZodString>;
        followedAt: z.ZodString;
        lastInteractionAt: z.ZodNullable<z.ZodString>;
        isBlocked: z.ZodDefault<z.ZodBoolean>;
        tags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        isBlocked: boolean;
        tags: string[];
    }, {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        tags: string[];
        isBlocked?: boolean | undefined;
    }>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
    ok: boolean;
    data: {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        tags: string[];
        isBlocked?: boolean | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const FanResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        lineUserId: z.ZodString;
        displayName: z.ZodNullable<z.ZodString>;
        pictureUrl: z.ZodNullable<z.ZodString>;
        followedAt: z.ZodString;
        lastInteractionAt: z.ZodNullable<z.ZodString>;
        isBlocked: z.ZodDefault<z.ZodBoolean>;
        tags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        isBlocked: boolean;
        tags: string[];
    }, {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        tags: string[];
        isBlocked?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
    ok: boolean;
    data: {
        id: string;
        lineUserId: string;
        displayName: string | null;
        pictureUrl: string | null;
        followedAt: string;
        lastInteractionAt: string | null;
        tags: string[];
        isBlocked?: boolean | undefined;
    };
}>;
export type Fan = z.infer<typeof Fan>;
export type FanListResponse = z.infer<typeof FanListResponse>;
export type FanResponse = z.infer<typeof FanResponse>;
