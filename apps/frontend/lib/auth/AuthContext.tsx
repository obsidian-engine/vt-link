"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  authService as defaultAuthService,
  redirectToLineLogin as defaultRedirectToLineLogin,
  type AuthService,
  type AuthTokens,
} from "./authService";

// 認証状態の型定義
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Contextの値の型定義
export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
}

// Context作成（undefinedで初期化してProvider外での使用を検出）
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
  // テスト用DI
  authService?: AuthService;
  redirectToLineLogin?: () => void;
}

/**
 * 認証プロバイダー
 *
 * 責務:
 * - 認証状態の管理（isAuthenticated, isLoading）
 * - トークンの保存・削除
 * - ログイン・ログアウト処理
 *
 * 設計原則:
 * - カスタムイベントを使わず、React状態で管理
 * - テスト可能なDI設計
 */
export function AuthProvider({
  children,
  authService = defaultAuthService,
  redirectToLineLogin = defaultRedirectToLineLogin,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化: API経由で認証状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.checkAuth();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, [authService]);

  // ログイン処理（LINE OAuth）
  // React 19 Compiler が自動最適化するため useCallback 不要
  const login = async () => {
    await redirectToLineLogin();
  };

  // ログアウト処理
  const logout = async () => {
    try {
      const { config } = await import("../config");
      await fetch(`${config.apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      // APIの成功・失敗に関わらず、状態をクリア
      authService.clearTokens();
      setIsAuthenticated(false);
      // ログインページにリダイレクト
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  // トークン保存後の状態更新（実際のCookie設定はバックエンドが行う）
  const setTokens = (tokens: AuthTokens) => {
    // HttpOnly Cookieはバックエンドでのみ設定可能
    // ここでは認証状態を更新するのみ
    setIsAuthenticated(true);
  };

  // Context値
  // React 19 Compiler が自動メモ化するため useMemo 不要
  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
