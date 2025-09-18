# Vercel デプロイメントガイド

vt-linkプロジェクトをVercelにデプロイするための手順とベストプラクティス

## 1. Vercelプロジェクト作成

### CLI経由での作成

```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトルートでVercelにログイン
vercel login

# プロジェクトの初期設定
vercel

# プロジェクト設定質問への回答例:
# ? Set up and deploy "~/vt-link-infra-agent"? [Y/n] y
# ? Which scope do you want to deploy to? Your personal account
# ? Link to existing project? [y/N] n
# ? What's your project's name? vt-link
# ? In which directory is your code located? ./
```

### Webコンソール経由での作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. "New Project" → "Import Git Repository"
3. GitHubリポジトリ `vt-link-infra-agent` を選択
4. プロジェクト設定:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/frontend/.next`
   - **Install Command**: `pnpm install`

## 2. 環境変数設定

### 必須環境変数

```bash
# データベース接続
vercel env add DATABASE_URL
# 例: postgresql://user:pass@ep-name-123.region.aws.neon.tech/vt_link_db?sslmode=require

# スケジューラー認証
vercel env add SCHEDULER_SECRET
# 例: your-strong-secret-key-256-bits-long

# LINE Messaging API
vercel env add LINE_CHANNEL_ACCESS_TOKEN
# 例: your-line-channel-access-token-here

# 本番環境の場合、各環境に個別設定
vercel env add DATABASE_URL production
vercel env add SCHEDULER_SECRET production
vercel env add LINE_CHANNEL_ACCESS_TOKEN production
```

### 環境別設定

```bash
# 開発環境
vercel env add NODE_ENV development
vercel env add NEXT_PUBLIC_API_URL "http://localhost:3000" development

# ステージング環境
vercel env add NODE_ENV preview
vercel env add NEXT_PUBLIC_API_URL "https://vt-link-git-staging.vercel.app" preview

# 本番環境
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_API_URL "https://vt-link.vercel.app" production
```

## 3. デプロイメント設定

### vercel.json の最適化

現在の設定は以下の特徴があります:

- **Go Functions**: 30秒タイムアウト、512MB メモリ
- **CORS**: API エンドポイントで適切に設定
- **ルーティング**: `/api/*` を Go Functions にルーティング

### ビルド設定最適化

```bash
# Package.json でのビルドスクリプト確認
# ルートのpackage.jsonの "build" スクリプト:
# "build": "pnpm gen && pnpm -r build"

# これにより以下が実行される:
# 1. pnpm gen (型生成: Zod → OpenAPI → TypeScript)
# 2. pnpm -r build (全パッケージのビルド)
```

## 4. デプロイコマンド

### 開発プレビューデプロイ

```bash
# 現在のブランチをプレビューデプロイ
vercel

# 特定のブランチをプレビューデプロイ
vercel --prod=false
```

### 本番デプロイ

```bash
# 本番環境にデプロイ (mainブランチ推奨)
vercel --prod

# 自動デプロイの場合は Git push でトリガー
git push origin main
```

## 5. ドメイン設定 (完全無料構成)

### デフォルトドメイン使用 (推奨)

```
https://vt-link.vercel.app
https://vt-link-git-[branch].vercel.app  # ブランチごと
```

### カスタムドメイン (オプション)

```bash
# 独自ドメインを追加 (有料の場合)
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

## 6. パフォーマンス最適化

### Function設定

```json
{
  "functions": {
    "apps/backend/api/**/*.go": {
      "runtime": "go1.x",
      "maxDuration": 30,     // Hobby プランの上限
      "memory": 512          // 512MB (最適化済み)
    }
  }
}
```

### 静的アセット最適化

- **画像**: Next.js Image Optimization 有効
- **フォント**: Google Fonts の最適化
- **CSS**: Tailwind CSS の purge 設定

## 7. 監視・ログ

### Vercel Analytics

```bash
# Vercel Analytics を有効化
vercel analytics enable

# Real-time logs 表示
vercel logs [deployment-url]
```

### Function監視

- **実行時間**: Functions タブで確認
- **メモリ使用量**: Insights で確認
- **エラー率**: Monitoring タブで確認

## 8. Hobbyプラン制限と対策

### 制限事項

- **Function実行時間**: 30秒 (Serverless)
- **ビルド時間**: 45分/月
- **帯域**: 100GB/月
- **Function実行**: 100GB時間/月

### 最適化戦略

1. **軽量Function**:
   - DBクエリ最適化
   - 接続プール適切設定
   - 不要な処理削除

2. **静的配信活用**:
   - 画像の適切な圧縮
   - CDN活用 (Vercel Edge Network)

3. **ビルド時間短縮**:
   - 型生成の最適化
   - 並列ビルド活用

## 9. トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```
   Error: Command "pnpm gen" failed
   ```
   → 型生成の依存関係を確認

2. **Function timeout**
   ```
   Error: Function execution timed out
   ```
   → DBクエリ最適化、接続プール調整

3. **CORS エラー**
   ```
   Error: CORS policy blocked
   ```
   → vercel.json の headers 設定確認

### デバッグ方法

```bash
# ローカルでVercel環境をシミュレート
vercel dev

# Function を個別テスト
vercel dev --listen 3001
curl http://localhost:3001/api/healthz
```

## 10. CI/CD パイプライン

### GitHub Integration

1. **自動デプロイ**: `main` ブランチへのpushで本番デプロイ
2. **プレビューデプロイ**: PR作成で自動プレビュー生成
3. **Environment protection**: 本番デプロイに承認設定 (オプション)

### 手動トリガー

```bash
# GitHub Actions からのデプロイ (オプション)
vercel deploy --token $VERCEL_TOKEN --prod
```