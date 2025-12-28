import { z } from 'zod';
export declare const User: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    pictureUrl: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    displayName: string;
    pictureUrl: string | null;
    email: string | null;
}, {
    id: string;
    displayName: string;
    pictureUrl: string | null;
    email: string | null;
}>;
export declare const LoginRequest: z.ZodObject<{
    code: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    state?: string | undefined;
}, {
    code: string;
    state?: string | undefined;
}>;
export declare const LoginResponse: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: z.ZodObject<{
        accessToken: z.ZodString;
        refreshToken: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            displayName: z.ZodString;
            pictureUrl: z.ZodNullable<z.ZodString>;
            email: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        }, {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        };
    }, {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    ok: true;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        };
    };
}, {
    ok: true;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            displayName: string;
            pictureUrl: string | null;
            email: string | null;
        };
    };
}>;
export declare const RefreshTokenRequest: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const RefreshTokenResponse: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: z.ZodObject<{
        accessToken: z.ZodString;
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        accessToken: string;
        refreshToken: string;
    }, {
        accessToken: string;
        refreshToken: string;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: true;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}, {
    ok: true;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export type User = z.infer<typeof User>;
export type LoginRequest = z.infer<typeof LoginRequest>;
export type LoginResponse = z.infer<typeof LoginResponse>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequest>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponse>;
