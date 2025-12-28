# フロントエンド デプロイ手順書

## 前提条件

- Node.js 20.x
- pnpm 9.15.0
- Vercel CLI (オプション)

## 環境変数設定

### 必須環境変数

| 変数名 | 用途 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_API_BASE` | バックエンドAPIのベースURL | `https://api.vt-link.com` |
| `NEXT_PUBLIC_LINE_CLIENT_ID` | LINE OAuth クライアントID | `1234567890` |
| `NEXT_PUBLIC_LINE_REDIRECT_URI` | LINE OAuth リダイレクトURI | `https://vt-link.com/auth/callback` |
| `NODE_ENV` | 実行環境 | `production` |

### Vercel環境変数設定

Vercelダッシュボード > Settings > Environment Variables で設定：

1. `NEXT_PUBLIC_API_BASE` → Production
2. `NEXT_PUBLIC_LINE_CLIENT_ID` → Production
3. `NEXT_PUBLIC_LINE_REDIRECT_URI` → Production

## デプロイ方法

### 方法1: Git Push（推奨）

```bash
# developブランチで作業
git checkout develop
git add .
git commit -m "feat: デプロイ準備完了"
git push origin develop

# mainブランチにマージ
git checkout main
git merge develop
git push origin main
```

→ GitHub Actionsが自動実行され、Vercelにデプロイ

### 方法2: Vercel CLI

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

## デプロイ前チェックリスト

- [ ] `npm run lint` ✅ パス
- [ ] `npm run type-check` ✅ パス
- [ ] `npm run build` ✅ 成功
- [ ] `.env.production` 設定確認
- [ ] Vercel環境変数設定完了
- [ ] バックエンドAPIが稼働中

## デプロイ後確認

### 1. 正常動作確認

- [ ] トップページ (`/`) 表示確認
- [ ] ログインページ (`/login`) 表示確認
- [ ] LINE OAuth認証フロー確認
- [ ] 認証後のダッシュボード表示確認

### 2. セキュリティヘッダー確認

```bash
curl -I https://your-domain.vercel.app
```

以下のヘッダーが含まれていることを確認：

- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

### 3. パフォーマンス確認

- [ ] Lighthouse スコア 90+ (Performance)
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
npm run clean
rm -rf node_modules .next
pnpm i
npm run build
```

### 環境変数が反映されない

1. Vercelダッシュボードで環境変数を確認
2. デプロイを再実行: `vercel --prod --force`

### APIエンドポイントに接続できない

1. `NEXT_PUBLIC_API_BASE` が正しいか確認
2. バックエンドAPIのCORS設定を確認
3. Network タブでリクエスト内容を確認

## ロールバック

```bash
# Vercel CLIでロールバック
vercel rollback

# または Vercelダッシュボードから前のデプロイメントに戻す
```

## CI/CD設定

### GitHub Actions

- **Workflow**: `.github/workflows/ci-optimized.yml`
- **トリガー**: PR作成時、main/developへのpush
- **実行内容**:
  - Lint & Type Check
  - Build
  - 型生成ファイルのdiff確認

### Deploy Workflow

- **Workflow**: `.github/workflows/deploy.yml`
- **トリガー**: mainブランチへのpush
- **実行内容**:
  - 依存関係インストール
  - 型生成 (`pnpm gen`)
  - ビルド (`pnpm build`)
  - Vercel Git Integration でデプロイ

## セキュリティ対策

### 実装済み

- ✅ HttpOnly Cookie認証
- ✅ CSRF トークン検証
- ✅ セキュリティヘッダー（next.config.ts + vercel.json）
- ✅ 環境別console制御（本番では出力しない）
- ✅ 型安全性（any禁止、strict mode）

### 推奨事項

- [ ] Sentry等のエラー監視サービス導入
- [ ] Rate Limiting（バックエンド側）
- [ ] WAF設定（Vercel Firewall）
- [ ] 定期的な依存パッケージ更新

## パフォーマンス最適化

### 実装済み

- ✅ React 19 Compiler自動最適化
- ✅ Next.js 16 Turbopack
- ✅ Static Generation（SSG）
- ✅ 画像最適化（next/image）

### 推奨事項

- [ ] Bundle Analyzer で不要な依存削除
- [ ] Code Splitting最適化
- [ ] CDN最適化（Vercel Edge Network）

## 監視・アラート

### 推奨設定

1. **Vercel Analytics** 有効化
2. **Vercel Speed Insights** 有効化
3. **Sentry** エラー監視（オプション）
4. **Uptime Monitor** 稼働監視（オプション）

---

**最終更新**: 2025-12-28
**担当**: DevOps Team
**バージョン**: v1.0.0
