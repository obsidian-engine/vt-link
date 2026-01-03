"use client";

import { useEffect } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 認証エリア専用エラーバウンダリ
 *
 * 認証済みページでのエラーをキャッチし、
 * ユーザーに適切なエラー画面とリカバリー手段を提供
 */
export default function AuthenticatedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをコンソールに記録
    console.error("Authenticated area error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-card rounded-lg shadow-lg border border-border p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-destructive/10 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-3">
          エラーが発生しました
        </h1>

        <p className="text-center text-muted-foreground mb-8">
          申し訳ございません。ページの読み込み中にエラーが発生しました。
          <br />
          以下のいずれかの方法をお試しください。
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-8 p-4 bg-muted rounded-lg border border-border">
            <summary className="cursor-pointer text-sm font-semibold text-foreground mb-3">
              エラー詳細（開発環境のみ）
            </summary>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Message:
                </p>
                <pre className="text-xs text-foreground bg-background p-2 rounded overflow-auto">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Digest:
                  </p>
                  <code className="text-xs text-foreground">
                    {error.digest}
                  </code>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Stack:
                  </p>
                  <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            ページを再読み込み
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center justify-center gap-2 w-full bg-muted text-muted-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <Home className="w-4 h-4" />
            ダッシュボードに戻る
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          問題が解決しない場合は、サポートにお問い合わせください。
        </p>
      </div>
    </div>
  );
}
