import { z } from 'zod';
export declare const RichMenuTemplate: z.ZodEnum<["2x3", "1x3", "2x2"]>;
export declare const RichMenuActionType: z.ZodEnum<["uri", "message"]>;
export declare const RichMenuBounds: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    width: number;
    height: number;
}, {
    x: number;
    y: number;
    width: number;
    height: number;
}>;
export declare const RichMenuAction: z.ZodObject<{
    type: z.ZodEnum<["uri", "message"]>;
    uri: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "message" | "uri";
    uri?: string | undefined;
    label?: string | undefined;
    text?: string | undefined;
}, {
    type: "message" | "uri";
    uri?: string | undefined;
    label?: string | undefined;
    text?: string | undefined;
}>;
export declare const RichMenuArea: z.ZodObject<{
    bounds: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    action: z.ZodObject<{
        type: z.ZodEnum<["uri", "message"]>;
        uri: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "message" | "uri";
        uri?: string | undefined;
        label?: string | undefined;
        text?: string | undefined;
    }, {
        type: "message" | "uri";
        uri?: string | undefined;
        label?: string | undefined;
        text?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    action: {
        type: "message" | "uri";
        uri?: string | undefined;
        label?: string | undefined;
        text?: string | undefined;
    };
}, {
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    action: {
        type: "message" | "uri";
        uri?: string | undefined;
        label?: string | undefined;
        text?: string | undefined;
    };
}>;
export declare const RichMenu: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    template: z.ZodEnum<["2x3", "1x3", "2x2"]>;
    imageUrl: z.ZodString;
    areas: z.ZodArray<z.ZodObject<{
        bounds: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        action: z.ZodObject<{
            type: z.ZodEnum<["uri", "message"]>;
            uri: z.ZodOptional<z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }>, "many">;
    lineRichMenuId: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    template: "2x3" | "1x3" | "2x2";
    areas: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[];
    lineRichMenuId: string | null;
    isActive: boolean;
}, {
    id: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    template: "2x3" | "1x3" | "2x2";
    areas: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[];
    lineRichMenuId: string | null;
    isActive: boolean;
}>;
export declare const CreateRichMenuRequest: z.ZodObject<{
    name: z.ZodString;
    template: z.ZodEnum<["2x3", "1x3", "2x2"]>;
    imageUrl: z.ZodString;
    areas: z.ZodArray<z.ZodObject<{
        bounds: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        action: z.ZodObject<{
            type: z.ZodEnum<["uri", "message"]>;
            uri: z.ZodOptional<z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    imageUrl: string;
    name: string;
    template: "2x3" | "1x3" | "2x2";
    areas: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[];
    isActive: boolean;
}, {
    imageUrl: string;
    name: string;
    template: "2x3" | "1x3" | "2x2";
    areas: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[];
    isActive?: boolean | undefined;
}>;
export declare const UpdateRichMenuRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    template: z.ZodOptional<z.ZodEnum<["2x3", "1x3", "2x2"]>>;
    imageUrl: z.ZodOptional<z.ZodString>;
    areas: z.ZodOptional<z.ZodArray<z.ZodObject<{
        bounds: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        action: z.ZodObject<{
            type: z.ZodEnum<["uri", "message"]>;
            uri: z.ZodOptional<z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }, {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }, {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }>, "many">>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    imageUrl?: string | undefined;
    name?: string | undefined;
    template?: "2x3" | "1x3" | "2x2" | undefined;
    areas?: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[] | undefined;
    isActive?: boolean | undefined;
}, {
    imageUrl?: string | undefined;
    name?: string | undefined;
    template?: "2x3" | "1x3" | "2x2" | undefined;
    areas?: {
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        action: {
            type: "message" | "uri";
            uri?: string | undefined;
            label?: string | undefined;
            text?: string | undefined;
        };
    }[] | undefined;
    isActive?: boolean | undefined;
}>;
export declare const RichMenuListResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        template: z.ZodEnum<["2x3", "1x3", "2x2"]>;
        imageUrl: z.ZodString;
        areas: z.ZodArray<z.ZodObject<{
            bounds: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                width: number;
                height: number;
            }, {
                x: number;
                y: number;
                width: number;
                height: number;
            }>;
            action: z.ZodObject<{
                type: z.ZodEnum<["uri", "message"]>;
                uri: z.ZodOptional<z.ZodString>;
                label: z.ZodOptional<z.ZodString>;
                text: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            }, {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }, {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }>, "many">;
        lineRichMenuId: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }, {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }[];
}, {
    ok: boolean;
    data: {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }[];
}>;
export declare const RichMenuResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        template: z.ZodEnum<["2x3", "1x3", "2x2"]>;
        imageUrl: z.ZodString;
        areas: z.ZodArray<z.ZodObject<{
            bounds: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                width: number;
                height: number;
            }, {
                x: number;
                y: number;
                width: number;
                height: number;
            }>;
            action: z.ZodObject<{
                type: z.ZodEnum<["uri", "message"]>;
                uri: z.ZodOptional<z.ZodString>;
                label: z.ZodOptional<z.ZodString>;
                text: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            }, {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }, {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }>, "many">;
        lineRichMenuId: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }, {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data: {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    };
}, {
    ok: boolean;
    data: {
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        name: string;
        template: "2x3" | "1x3" | "2x2";
        areas: {
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            action: {
                type: "message" | "uri";
                uri?: string | undefined;
                label?: string | undefined;
                text?: string | undefined;
            };
        }[];
        lineRichMenuId: string | null;
        isActive: boolean;
    };
}>;
export type RichMenu = z.infer<typeof RichMenu>;
export type RichMenuTemplate = z.infer<typeof RichMenuTemplate>;
export type RichMenuActionType = z.infer<typeof RichMenuActionType>;
export type RichMenuBounds = z.infer<typeof RichMenuBounds>;
export type RichMenuAction = z.infer<typeof RichMenuAction>;
export type RichMenuArea = z.infer<typeof RichMenuArea>;
export type CreateRichMenuRequest = z.infer<typeof CreateRichMenuRequest>;
export type UpdateRichMenuRequest = z.infer<typeof UpdateRichMenuRequest>;
export type RichMenuListResponse = z.infer<typeof RichMenuListResponse>;
export type RichMenuResponse = z.infer<typeof RichMenuResponse>;
