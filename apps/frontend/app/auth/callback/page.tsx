"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) return;

    const handleCallback = async () => {
      hasProcessed.current = true;

      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("認証に失敗しました");
        setTimeout(() => router.push("/login?error=auth_failed"), 2000);
        return;
      }

      if (!code || !state) {
        setError("認証パラメータが不足しています");
        setTimeout(() => router.push("/login?error=invalid_params"), 2000);
        return;
      }

      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
        const response = await fetch(`${apiBase}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error("認証リクエストに失敗しました");
        }

        const data = await response.json();

        if (!data.accessToken || !data.refreshToken || !data.user) {
          throw new Error("トークンまたはユーザー情報が取得できませんでした");
        }

        // Login with tokens (this will automatically redirect)
        login(data.accessToken, data.refreshToken, data.user);
      } catch (err) {
        console.error("認証エラー:", err);
        setError("認証処理中にエラーが発生しました");
        setTimeout(() => router.push("/login?error=auth_error"), 2000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        {error ? (
          <>
            <div className="text-red-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-semibold">{error}</h2>
              <p className="mt-2 text-sm text-gray-600">
                ログイン画面にリダイレクトします...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              認証処理中...
            </h2>
            <p className="text-sm text-gray-600">しばらくお待ちください</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
