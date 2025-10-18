import { z } from 'zod';
export declare const MessageStatus: z.ZodEnum<["draft", "scheduled", "sent", "failed"]>;
export declare const Message: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    imageUrl: z.ZodNullable<z.ZodString>;
    scheduledAt: z.ZodNullable<z.ZodString>;
    sentAt: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["draft", "scheduled", "sent", "failed"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: "draft" | "scheduled" | "sent" | "failed";
    id: string;
    body: string;
    imageUrl: string | null;
    scheduledAt: string | null;
    sentAt: string | null;
    createdAt: string;
    updatedAt: string;
}, {
    title: string;
    status: "draft" | "scheduled" | "sent" | "failed";
    id: string;
    body: string;
    imageUrl: string | null;
    scheduledAt: string | null;
    sentAt: string | null;
    createdAt: string;
    updatedAt: string;
}>;
export declare const CreateMessageRequest: z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["draft", "scheduled"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: "draft" | "scheduled";
    body: string;
    imageUrl?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    title: string;
    body: string;
    status?: "draft" | "scheduled" | undefined;
    imageUrl?: string | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const UpdateMessageRequest: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    scheduledAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["draft", "scheduled"]>>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    status?: "draft" | "scheduled" | undefined;
    body?: string | undefined;
    imageUrl?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    title?: string | undefined;
    status?: "draft" | "scheduled" | undefined;
    body?: string | undefined;
    imageUrl?: string | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const MessageListResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        imageUrl: z.ZodNullable<z.ZodString>;
        scheduledAt: z.ZodNullable<z.ZodString>;
        sentAt: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["draft", "scheduled", "sent", "failed"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }, {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }[];
}, {
    ok: boolean;
    data: {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }[];
}>;
export declare const MessageResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        imageUrl: z.ZodNullable<z.ZodString>;
        scheduledAt: z.ZodNullable<z.ZodString>;
        sentAt: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["draft", "scheduled", "sent", "failed"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }, {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    };
}, {
    ok: boolean;
    data: {
        title: string;
        status: "draft" | "scheduled" | "sent" | "failed";
        id: string;
        body: string;
        imageUrl: string | null;
        scheduledAt: string | null;
        sentAt: string | null;
        createdAt: string;
        updatedAt: string;
    };
}>;
export type Message = z.infer<typeof Message>;
export type MessageStatus = z.infer<typeof MessageStatus>;
export type CreateMessageRequest = z.infer<typeof CreateMessageRequest>;
export type UpdateMessageRequest = z.infer<typeof UpdateMessageRequest>;
export type MessageListResponse = z.infer<typeof MessageListResponse>;
export type MessageResponse = z.infer<typeof MessageResponse>;
