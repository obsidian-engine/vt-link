"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なページを保護するコンポーネント
 *
 * @param {ProtectedRouteProps} props - コンポーネントのprops
 * @returns {React.ReactElement} 認証状態に応じたコンテンツ
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
}
