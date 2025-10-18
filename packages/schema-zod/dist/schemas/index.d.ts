export * from './message.js';
export * from './fan.js';
import { z } from 'zod';
export declare const ApiError: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, any> | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, any> | undefined;
    };
}, {
    ok: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, any> | undefined;
    };
}>;
export declare const ApiSuccess: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ok: true;
    message?: string | undefined;
}, {
    ok: true;
    message?: string | undefined;
}>;
export type ApiError = z.infer<typeof ApiError>;
export type ApiSuccess = z.infer<typeof ApiSuccess>;
