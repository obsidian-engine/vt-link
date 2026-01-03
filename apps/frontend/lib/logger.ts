/**
 * 構造化ログ
 *
 * JSON形式のログ出力とログレベル制御を提供
 */

import { config } from "./config";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;

  constructor() {
    // 本番環境では info レベル以上のみ出力
    this.level = config.environment === "production" ? "info" : "debug";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      ...context,
    };
  }

  /**
   * デバッグログ（開発環境のみ）
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      const entry = this.formatLog("debug", message, context);
      if (config.environment === "production") {
        console.log(JSON.stringify(entry));
      } else {
        console.log(`[DEBUG] ${message}`, context || "");
      }
    }
  }

  /**
   * 情報ログ
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      const entry = this.formatLog("info", message, context);
      if (config.environment === "production") {
        console.info(JSON.stringify(entry));
      } else {
        console.info(`[INFO] ${message}`, context || "");
      }
    }
  }

  /**
   * 警告ログ
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      const entry = this.formatLog("warn", message, context);
      if (config.environment === "production") {
        console.warn(JSON.stringify(entry));
      } else {
        console.warn(`[WARN] ${message}`, context || "");
      }
    }
  }

  /**
   * エラーログ
   */
  error(message: string, context?: LogContext): void {
    const entry = this.formatLog("error", message, context);
    if (config.environment === "production") {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`[ERROR] ${message}`, context || "");
    }
  }
}

/**
 * ロガーのシングルトンインスタンス
 */
export const logger = new Logger();
