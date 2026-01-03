"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * グローバルエラーバウンダリ
 *
 * アプリケーション全体のランタイムエラーをキャッチし、
 * ユーザーに適切なエラー画面を表示
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをコンソールに記録（本番環境では監視サービスに送信することを推奨）
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          エラーが発生しました
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          申し訳ございません。予期しないエラーが発生しました。
          <br />
          もう一度お試しください。
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              エラー詳細（開発環境のみ表示）
            </summary>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            もう一度試す
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
