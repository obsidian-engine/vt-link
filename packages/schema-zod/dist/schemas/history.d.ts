import { z } from 'zod';
export declare const MessageHistoryStatus: z.ZodEnum<["sent", "failed", "pending"]>;
export declare const MessageHistory: z.ZodObject<{
    id: z.ZodString;
    messageId: z.ZodString;
    status: z.ZodEnum<["sent", "failed", "pending"]>;
    sentAt: z.ZodNullable<z.ZodString>;
    recipientCount: z.ZodNumber;
    errorMessage: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "sent" | "failed" | "pending";
    id: string;
    sentAt: string | null;
    createdAt: string;
    messageId: string;
    recipientCount: number;
    errorMessage: string | null;
}, {
    status: "sent" | "failed" | "pending";
    id: string;
    sentAt: string | null;
    createdAt: string;
    messageId: string;
    recipientCount: number;
    errorMessage: string | null;
}>;
export declare const MessageHistoryListResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        messageId: z.ZodString;
        status: z.ZodEnum<["sent", "failed", "pending"]>;
        sentAt: z.ZodNullable<z.ZodString>;
        recipientCount: z.ZodNumber;
        errorMessage: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }, {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }[];
}, {
    ok: boolean;
    data: {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }[];
}>;
export declare const MessageHistoryResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        messageId: z.ZodString;
        status: z.ZodEnum<["sent", "failed", "pending"]>;
        sentAt: z.ZodNullable<z.ZodString>;
        recipientCount: z.ZodNumber;
        errorMessage: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }, {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    };
}, {
    ok: boolean;
    data: {
        status: "sent" | "failed" | "pending";
        id: string;
        sentAt: string | null;
        createdAt: string;
        messageId: string;
        recipientCount: number;
        errorMessage: string | null;
    };
}>;
export type MessageHistory = z.infer<typeof MessageHistory>;
export type MessageHistoryStatus = z.infer<typeof MessageHistoryStatus>;
export type MessageHistoryListResponse = z.infer<typeof MessageHistoryListResponse>;
export type MessageHistoryResponse = z.infer<typeof MessageHistoryResponse>;
