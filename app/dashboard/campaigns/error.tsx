'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録（本番環境では適切なログサービスに送信）
    console.error('Campaign page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">🚨</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">
          キャンペーンページの読み込み中に問題が発生しました。
          しばらく待ってから再度お試しください。
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
          <a
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            ダッシュボードに戻る
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              技術的な詳細（開発モードのみ）
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
