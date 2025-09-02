import type {
  LineChannelID,
  LineRichMenuID,
  LineUserID,
  URL,
} from "@/domain/valueObjects/BaseTypes";
import { IDFactory } from "@/domain/valueObjects/IDFactory";
/**
 * 型安全なLINE Bot API クライアント
 * 公式APIの型定義を厳密に実装し、ランタイム検証も行う
 */
import { z } from "zod";
import type {
  LineApiResponse,
  LineBroadcastRequest,
  LineErrorResponse,
  LineMessage,
  LineNarrowcastRequest,
  LinePushRequest,
  LineReplyRequest,
  LineRichMenuRequest,
  LineRichMenuResponse,
} from "./types";

// ============================================================================
// エラークラス定義
// ============================================================================
export class LineApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: LineErrorResponse,
  ) {
    super(message);
    this.name = "LineApiError";
  }
}

export class LineApiValidationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: z.ZodError,
  ) {
    super(message);
    this.name = "LineApiValidationError";
  }
}

// ============================================================================
// Zodスキーマ定義
// ============================================================================
const LineMessageSchema: z.ZodType<LineMessage> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(5000),
    emojis: z.array(z.any()).optional(),
    mention: z.any().optional(),
    quotedMessageId: z.string().optional(),
    quoteToken: z.string().optional(),
  }),
  z.object({
    type: z.literal("image"),
    originalContentUrl: z.string().url(),
    previewImageUrl: z.string().url(),
  }),
  z.object({
    type: z.literal("sticker"),
    packageId: z.string(),
    stickerId: z.string(),
    stickerResourceType: z
      .enum([
        "STATIC",
        "ANIMATION",
        "SOUND",
        "ANIMATION_SOUND",
        "POPUP",
        "POPUP_SOUND",
        "CUSTOM",
        "MESSAGE",
      ])
      .optional(),
    keywords: z.array(z.string()).optional(),
    text: z.string().optional(),
  }),
]);

const LineBroadcastRequestSchema = z.object({
  messages: z.array(LineMessageSchema).min(1).max(5),
  notificationDisabled: z.boolean().optional(),
});

const LineNarrowcastRequestSchema = z.object({
  messages: z.array(LineMessageSchema).min(1).max(5),
  recipient: z.object({
    type: z.enum(["user", "audience"]),
    userIds: z.array(z.string()).optional(),
    audienceGroupId: z.number().optional(),
  }),
  filter: z.any().optional(),
  limit: z
    .object({
      max: z.number().optional(),
      upToRemainingQuota: z.boolean().optional(),
    })
    .optional(),
  notificationDisabled: z.boolean().optional(),
});

const LineReplyRequestSchema = z.object({
  replyToken: z.string(),
  messages: z.array(LineMessageSchema).min(1).max(5),
  notificationDisabled: z.boolean().optional(),
});

const LinePushRequestSchema = z.object({
  to: z.string(),
  messages: z.array(LineMessageSchema).min(1).max(5),
  notificationDisabled: z.boolean().optional(),
});

const LineRichMenuRequestSchema = z.object({
  size: z.object({
    width: z.number().int().min(1).max(2500),
    height: z.number().int().min(1).max(1686),
  }),
  selected: z.boolean(),
  name: z.string().min(1).max(300),
  chatBarText: z.string().min(1).max(14),
  areas: z
    .array(
      z.object({
        bounds: z.object({
          x: z.number().int().min(0),
          y: z.number().int().min(0),
          width: z.number().int().min(1),
          height: z.number().int().min(1),
        }),
        action: z.any(), // アクションの詳細なスキーマは省略
      }),
    )
    .max(20),
});

// ============================================================================
// APIクライアント実装
// ============================================================================
export class LineApiClient {
  readonly #baseUrl = "https://api.line.me/v2/bot";
  readonly #channelAccessToken: string;
  readonly #channelId: LineChannelID;

  constructor(channelAccessToken: string, channelId: string) {
    if (!channelAccessToken) {
      throw new Error("LINE channel access token is required");
    }

    this.#channelAccessToken = channelAccessToken;
    this.#channelId = IDFactory.createLineChannelID(channelId);
  }

  // ============================================================================
  // メッセージ送信メソッド
  // ============================================================================

  /**
   * ブロードキャストメッセージ送信
   */
  async sendBroadcast(request: LineBroadcastRequest): Promise<LineApiResponse> {
    try {
      const validatedRequest = LineBroadcastRequestSchema.parse(request);

      const response = await this.#makeRequest("/message/broadcast", {
        method: "POST",
        body: validatedRequest,
      });

      return response as LineApiResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LineApiValidationError("Invalid broadcast request", error);
      }
      throw error;
    }
  }

  /**
   * ナローキャストメッセージ送信
   */
  async sendNarrowcast(
    request: LineNarrowcastRequest,
  ): Promise<LineApiResponse> {
    try {
      const validatedRequest = LineNarrowcastRequestSchema.parse(request);

      const response = await this.#makeRequest("/message/narrowcast", {
        method: "POST",
        body: validatedRequest,
      });

      return response as LineApiResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LineApiValidationError("Invalid narrowcast request", error);
      }
      throw error;
    }
  }

  /**
   * リプライメッセージ送信
   */
  async sendReply(request: LineReplyRequest): Promise<LineApiResponse> {
    try {
      const validatedRequest = LineReplyRequestSchema.parse(request);

      const response = await this.#makeRequest("/message/reply", {
        method: "POST",
        body: validatedRequest,
      });

      return response as LineApiResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LineApiValidationError("Invalid reply request", error);
      }
      throw error;
    }
  }

  /**
   * プッシュメッセージ送信
   */
  async sendPush(request: LinePushRequest): Promise<LineApiResponse> {
    try {
      const validatedRequest = LinePushRequestSchema.parse(request);

      const response = await this.#makeRequest("/message/push", {
        method: "POST",
        body: validatedRequest,
      });

      return response as LineApiResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LineApiValidationError("Invalid push request", error);
      }
      throw error;
    }
  }

  // ============================================================================
  // リッチメニューメソッド
  // ============================================================================

  /**
   * リッチメニュー作成
   */
  async createRichMenu(
    request: LineRichMenuRequest,
  ): Promise<LineRichMenuResponse> {
    try {
      const validatedRequest = LineRichMenuRequestSchema.parse(request);

      const response = await this.#makeRequest("/richmenu", {
        method: "POST",
        body: validatedRequest,
      });

      const richMenuId = IDFactory.createLineRichMenuID(response.richMenuId);
      return {
        ...validatedRequest,
        richMenuId,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new LineApiValidationError("Invalid rich menu request", error);
      }
      throw error;
    }
  }

  /**
   * リッチメニュー画像アップロード
   */
  async uploadRichMenuImage(
    richMenuId: LineRichMenuID,
    imageBuffer: Buffer,
    contentType: "image/jpeg" | "image/png" = "image/png",
  ): Promise<void> {
    const response = await fetch(
      `${this.#baseUrl}/richmenu/${richMenuId}/content`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.#channelAccessToken}`,
          "Content-Type": contentType,
        },
        body: imageBuffer,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse: LineErrorResponse | undefined;

      try {
        errorResponse = JSON.parse(errorText);
      } catch {
        // JSON解析に失敗した場合は無視
      }

      throw new LineApiError(
        `LINE API error: ${response.status} ${errorText}`,
        response.status,
        errorResponse,
      );
    }
  }

  /**
   * デフォルトリッチメニュー設定
   */
  async setDefaultRichMenu(richMenuId: LineRichMenuID): Promise<void> {
    await this.#makeRequest(`/user/all/richmenu/${richMenuId}`, {
      method: "POST",
    });
  }

  /**
   * リッチメニュー削除
   */
  async deleteRichMenu(richMenuId: LineRichMenuID): Promise<void> {
    await this.#makeRequest(`/richmenu/${richMenuId}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // ユーザー情報メソッド
  // ============================================================================

  /**
   * ユーザープロフィール取得
   */
  async getUserProfile(userId: LineUserID): Promise<{
    displayName: string;
    pictureUrl?: URL;
    language?: string;
  }> {
    const response = await this.#makeRequest(`/profile/${userId}`, {
      method: "GET",
    });

    return {
      displayName: response.displayName,
      pictureUrl: response.pictureUrl
        ? (response.pictureUrl as URL)
        : undefined,
      language: response.language,
    };
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private async #makeRequest(
    endpoint: string,
    options: {
      method: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      headers?: Record<string, string>;
    },
  ): Promise<any> {
    const url = `${this.#baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.#channelAccessToken}`,
      ...options.headers,
    };

    if (options.body && options.method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse: LineErrorResponse | undefined;

      try {
        errorResponse = JSON.parse(errorText);
      } catch {
        // JSON解析に失敗した場合は無視
      }

      throw new LineApiError(
        `LINE API error: ${response.status} ${errorText}`,
        response.status,
        errorResponse,
      );
    }

    // DELETEリクエストは通常レスポンスボディがない
    if (options.method === "DELETE") {
      return {};
    }

    return response.json();
  }

  // ============================================================================
  // ヘルパーメソッド
  // ============================================================================

  get channelId(): LineChannelID {
    return this.#channelId;
  }

  /**
   * APIクライアントのヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      // ボット情報を取得してAPIの正常性を確認
      await this.#makeRequest("/info", { method: "GET" });
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// ファクトリ関数
// ============================================================================

/**
 * LINE APIクライアントのファクトリ関数
 */
export const createLineApiClient = (
  channelAccessToken: string,
  channelId: string,
): LineApiClient => {
  return new LineApiClient(channelAccessToken, channelId);
};
