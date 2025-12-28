import { z } from 'zod';
export declare const AutoReplyRuleType: z.ZodEnum<["follow", "keyword"]>;
export declare const MatchType: z.ZodEnum<["exact", "partial"]>;
export declare const AutoReplyRule: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["follow", "keyword"]>;
    name: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    matchType: z.ZodOptional<z.ZodEnum<["exact", "partial"]>>;
    replyMessage: z.ZodString;
    isEnabled: z.ZodBoolean;
    priority: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "follow" | "keyword";
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    replyMessage: string;
    isEnabled: boolean;
    priority: number;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
}, {
    type: "follow" | "keyword";
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    replyMessage: string;
    isEnabled: boolean;
    priority: number;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
}>;
export declare const CreateAutoReplyRuleRequest: z.ZodObject<{
    type: z.ZodEnum<["follow", "keyword"]>;
    name: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    matchType: z.ZodOptional<z.ZodEnum<["exact", "partial"]>>;
    replyMessage: z.ZodString;
    isEnabled: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "follow" | "keyword";
    name: string;
    replyMessage: string;
    isEnabled: boolean;
    priority: number;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
}, {
    type: "follow" | "keyword";
    name: string;
    replyMessage: string;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
    isEnabled?: boolean | undefined;
    priority?: number | undefined;
}>;
export declare const UpdateAutoReplyRuleRequest: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["follow", "keyword"]>>;
    name: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    matchType: z.ZodOptional<z.ZodOptional<z.ZodEnum<["exact", "partial"]>>>;
    replyMessage: z.ZodOptional<z.ZodString>;
    isEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    type?: "follow" | "keyword" | undefined;
    name?: string | undefined;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
    replyMessage?: string | undefined;
    isEnabled?: boolean | undefined;
    priority?: number | undefined;
}, {
    type?: "follow" | "keyword" | undefined;
    name?: string | undefined;
    keywords?: string[] | undefined;
    matchType?: "exact" | "partial" | undefined;
    replyMessage?: string | undefined;
    isEnabled?: boolean | undefined;
    priority?: number | undefined;
}>;
export declare const AutoReplyRuleListResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["follow", "keyword"]>;
        name: z.ZodString;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        matchType: z.ZodOptional<z.ZodEnum<["exact", "partial"]>>;
        replyMessage: z.ZodString;
        isEnabled: z.ZodBoolean;
        priority: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }, {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }[];
}, {
    ok: boolean;
    data: {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }[];
}>;
export declare const AutoReplyRuleResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["follow", "keyword"]>;
        name: z.ZodString;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        matchType: z.ZodOptional<z.ZodEnum<["exact", "partial"]>>;
        replyMessage: z.ZodString;
        isEnabled: z.ZodBoolean;
        priority: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }, {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    };
}, {
    ok: boolean;
    data: {
        type: "follow" | "keyword";
        id: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        replyMessage: string;
        isEnabled: boolean;
        priority: number;
        keywords?: string[] | undefined;
        matchType?: "exact" | "partial" | undefined;
    };
}>;
export type AutoReplyRule = z.infer<typeof AutoReplyRule>;
export type AutoReplyRuleType = z.infer<typeof AutoReplyRuleType>;
export type MatchType = z.infer<typeof MatchType>;
export type CreateAutoReplyRuleRequest = z.infer<typeof CreateAutoReplyRuleRequest>;
export type UpdateAutoReplyRuleRequest = z.infer<typeof UpdateAutoReplyRuleRequest>;
export type AutoReplyRuleListResponse = z.infer<typeof AutoReplyRuleListResponse>;
export type AutoReplyRuleResponse = z.infer<typeof AutoReplyRuleResponse>;
