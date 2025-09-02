/**
 * Server Actions用の型定義
 * 型安全なServer Actionsのための共通型
 */
import { z } from 'zod';

// ============================================================================
// Server Action 結果型
// ============================================================================
export type ActionState<T = unknown> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly validationErrors?: ReadonlyArray<{
    readonly field: string;
    readonly message: string;
  }>;
  readonly timestamp: string;
};

// ============================================================================
// FormData から型安全な値を取得するヘルパー
// ============================================================================
export class FormDataParser {
  readonly #formData: FormData;

  constructor(formData: FormData) {
    this.#formData = formData;
  }

  getString(key: string, defaultValue?: string): string | undefined {
    const value = this.#formData.get(key);
    if (value === null) return defaultValue;
    return typeof value === 'string' ? value : defaultValue;
  }

  getRequiredString(key: string): string {
    const value = this.getString(key);
    if (value === undefined) {
      throw new Error(`Required field '${key}' is missing`);
    }
    return value;
  }

  getBoolean(key: string, defaultValue = false): boolean {
    const value = this.getString(key);
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1' || value === 'on';
  }

  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.getString(key);
    if (value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  getRequiredNumber(key: string): number {
    const value = this.getNumber(key);
    if (value === undefined) {
      throw new Error(`Required field '${key}' is missing or invalid`);
    }
    return value;
  }

  getArray(key: string): ReadonlyArray<string> {
    return this.#formData
      .getAll(key)
      .map((value) => (typeof value === 'string' ? value : String(value)));
  }

  getJSON<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.getString(key);
    if (value === undefined) return defaultValue;

    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }

  getRequiredJSON<T>(key: string): T {
    const value = this.getJSON<T>(key);
    if (value === undefined) {
      throw new Error(`Required JSON field '${key}' is missing or invalid`);
    }
    return value;
  }
}

// ============================================================================
// Server Action 実行ヘルパー
// ============================================================================
export class ActionExecutor {
  /**
   * Server Actionを型安全に実行し、エラーハンドリングを統一する
   */
  static async execute<T>(
    action: () => Promise<T>,
    onError?: (error: unknown) => string
  ): Promise<ActionState<T>> {
    try {
      const data = await action();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Server Action Error:', error);

      // Zodエラーの場合は詳細なバリデーションエラーを返す
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        };
      }

      // カスタムエラーメッセージがある場合はそれを使用
      if (onError) {
        return {
          success: false,
          error: onError(error),
          timestamp: new Date().toISOString(),
        };
      }

      // デフォルトエラーメッセージ
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * FormDataを使用するServer Actionを型安全に実行
   */
  static async executeWithFormData<T>(
    formData: FormData,
    schema: z.ZodType<T>,
    action: (validatedData: T) => Promise<any>
  ): Promise<ActionState<any>> {
    return this.execute(async () => {
      // FormDataを適切な形式に変換
      const rawData: Record<string, unknown> = {};
      const parser = new FormDataParser(formData);

      // FormDataの全てのキーを処理
      for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
          // 配列形式の処理
          const arrayKey = key.slice(0, -2);
          if (!rawData[arrayKey]) {
            rawData[arrayKey] = [];
          }
          (rawData[arrayKey] as unknown[]).push(value);
        } else if (key.includes('.')) {
          // ネストされたオブジェクトの処理（例: "user.name"）
          const keys = key.split('.');
          let current = rawData;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
              current[keys[i]] = {};
            }
            current = current[keys[i]] as Record<string, unknown>;
          }
          current[keys[keys.length - 1]] = value;
        } else {
          // 通常のフィールド
          rawData[key] = value;
        }
      }

      // スキーマでバリデーション
      const validatedData = schema.parse(rawData);

      // アクションを実行
      return await action(validatedData);
    });
  }

  /**
   * JSONリクエストを使用するServer Actionを型安全に実行
   */
  static async executeWithJSON<T>(
    jsonData: unknown,
    schema: z.ZodType<T>,
    action: (validatedData: T) => Promise<any>
  ): Promise<ActionState<any>> {
    return this.execute(async () => {
      // スキーマでバリデーション
      const validatedData = schema.parse(jsonData);

      // アクションを実行
      return await action(validatedData);
    });
  }
}

// ============================================================================
// Server Action デコレータ関数
// ============================================================================
/**
 * Server Actionにエラーハンドリングとログ機能を追加するデコレータ
 */
export function withActionLogging<T extends any[], R>(
  actionName: string,
  originalFunction: (...args: T) => Promise<ActionState<R>>
) {
  return async (...args: T): Promise<ActionState<R>> => {
    const startTime = Date.now();
    console.log(`[Server Action] ${actionName} started`);

    try {
      const result = await originalFunction(...args);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`[Server Action] ${actionName} completed successfully in ${duration}ms`);
      } else {
        console.warn(`[Server Action] ${actionName} failed in ${duration}ms:`, result.error);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Server Action] ${actionName} threw error in ${duration}ms:`, error);
      throw error;
    }
  };
}

/**
 * レート制限機能付きServer Actionデコレータ
 */
export function withRateLimit<T extends any[], R>(
  key: string,
  maxRequests: number,
  windowMs: number,
  originalFunction: (...args: T) => Promise<ActionState<R>>
) {
  const requests = new Map<string, number[]>();

  return async (...args: T): Promise<ActionState<R>> => {
    const now = Date.now();
    const requestKey = `${key}`;

    // 現在の時刻から計算したウィンドウ内のリクエスト回数を取得
    const requestTimes = requests.get(requestKey) || [];
    const validRequests = requestTimes.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString(),
      };
    }

    // 新しいリクエスト時刻を記録
    validRequests.push(now);
    requests.set(requestKey, validRequests);

    return await originalFunction(...args);
  };
}

// ============================================================================
// バリデーション済みServer Action型
// ============================================================================
export type ValidatedServerAction<TInput, TOutput> = (
  input: TInput
) => Promise<ActionState<TOutput>>;

export type FormServerAction<TOutput> = (
  prevState: ActionState<TOutput> | null,
  formData: FormData
) => Promise<ActionState<TOutput>>;

// ============================================================================
// 共通のバリデーションエラー型
// ============================================================================
export interface FieldError {
  readonly field: string;
  readonly message: string;
}

export interface ValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: ReadonlyArray<FieldError>;
}

/**
 * バリデーション結果を作成するヘルパー関数
 */
export const createValidationResult = <T>(
  success: boolean,
  data?: T,
  errors?: ReadonlyArray<FieldError>
): ValidationResult<T> => ({
  success,
  data,
  errors,
});

/**
 * ZodエラーからFieldErrorの配列に変換
 */
export const zodErrorToFieldErrors = (error: z.ZodError): ReadonlyArray<FieldError> => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};
