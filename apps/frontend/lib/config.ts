/**
 * アプリケーション設定
 *
 * 環境変数を一元管理し、起動時にバリデーションを実施
 */

export interface AppConfig {
  /** API Base URL */
  apiBase: string;
  /** LINE Channel ID */
  lineChannelId: string;
  /** LINE Callback URL */
  lineCallbackUrl: string;
  /** 環境（development | production） */
  environment: "development" | "production";
}

function loadConfig(): AppConfig {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const lineChannelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || "";
  const lineCallbackUrl = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || "";
  const environment =
    (process.env.NODE_ENV as "development" | "production") || "development";

  // 必須環境変数のバリデーション
  const missingVars: string[] = [];

  if (!apiBase) missingVars.push("NEXT_PUBLIC_API_BASE");
  if (!lineChannelId) missingVars.push("NEXT_PUBLIC_LINE_CHANNEL_ID");
  if (!lineCallbackUrl) missingVars.push("NEXT_PUBLIC_LINE_CALLBACK_URL");

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env file.",
    );
  }

  return {
    apiBase,
    lineChannelId,
    lineCallbackUrl,
    environment,
  };
}

/**
 * アプリケーション設定のシングルトンインスタンス
 *
 * 起動時に環境変数をバリデーションし、不正な設定を検出
 */
export const config: AppConfig = loadConfig();
