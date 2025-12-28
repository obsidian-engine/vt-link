import { z } from 'zod';
export declare const UserSettings: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    defaultReplyDelay: z.ZodDefault<z.ZodNumber>;
    notificationEnabled: z.ZodDefault<z.ZodBoolean>;
    timezone: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    defaultReplyDelay: number;
    notificationEnabled: boolean;
    timezone: string;
    language: string;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    defaultReplyDelay?: number | undefined;
    notificationEnabled?: boolean | undefined;
    timezone?: string | undefined;
    language?: string | undefined;
}>;
export declare const UserSettingsResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        defaultReplyDelay: z.ZodDefault<z.ZodNumber>;
        notificationEnabled: z.ZodDefault<z.ZodBoolean>;
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        defaultReplyDelay: number;
        notificationEnabled: boolean;
        timezone: string;
        language: string;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        defaultReplyDelay?: number | undefined;
        notificationEnabled?: boolean | undefined;
        timezone?: string | undefined;
        language?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        defaultReplyDelay: number;
        notificationEnabled: boolean;
        timezone: string;
        language: string;
    };
}, {
    ok: boolean;
    data: {
        id: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        defaultReplyDelay?: number | undefined;
        notificationEnabled?: boolean | undefined;
        timezone?: string | undefined;
        language?: string | undefined;
    };
}>;
export declare const UpdateUserSettingsRequest: z.ZodObject<{
    defaultReplyDelay: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    notificationEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    defaultReplyDelay?: number | undefined;
    notificationEnabled?: boolean | undefined;
    timezone?: string | undefined;
    language?: string | undefined;
}, {
    defaultReplyDelay?: number | undefined;
    notificationEnabled?: boolean | undefined;
    timezone?: string | undefined;
    language?: string | undefined;
}>;
export type UserSettings = z.infer<typeof UserSettings>;
export type UserSettingsResponse = z.infer<typeof UserSettingsResponse>;
export type UpdateUserSettingsRequest = z.infer<typeof UpdateUserSettingsRequest>;
