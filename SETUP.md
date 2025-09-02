# セットアップガイド

## GitHub Secrets の設定

このプロジェクトの自動デプロイを有効にするために、以下のGitHub Secretsを設定する必要があります。

### 設定手順

1. GitHub リポジトリページにアクセス
2. **Settings** タブをクリック
3. **Secrets and variables** > **Actions** をクリック
4. **New repository secret** をクリックして以下のシークレットを追加

### 必須シークレット

#### Supabase関連

**`SUPABASE_ACCESS_TOKEN`**

- **説明**: Supabase CLI用のアクセストークン
- **取得方法**:
  1. [Supabase Dashboard](https://app.supabase.com/) にログイン
  2. Account Settings > Access Tokens
  3. **Create new token** をクリック
  4. 適切な名前を付けてトークンを生成
  5. 生成されたトークンをコピー

**`SUPABASE_PROJECT_REF`**

- **説明**: SupabaseプロジェクトのリファレンスID
- **取得方法**:
  1. [Supabase Dashboard](https://app.supabase.com/) でプロジェクトを選択
  2. Settings > General > Reference ID をコピー
  3. 形式例: `abcdefghijklmnopqrstuvwxyz`

#### Vercel関連（任意 - 手動デプロイを使わない場合）

**`VERCEL_TOKEN`**

- **説明**: Vercel CLI用のトークン
- **取得方法**:
  1. [Vercel Dashboard](https://vercel.com/account/tokens) にアクセス
  2. **Create Token** をクリック
  3. 適切な名前を付けてトークンを生成
  4. 生成されたトークンをコピー

**`VERCEL_ORG_ID`** (任意)

- **説明**: Vercel組織ID
- **取得方法**: Vercel CLI で `vercel link` 実行後、`.vercel/project.json` から取得

**`VERCEL_PROJECT_ID`** (任意)

- **説明**: VercelプロジェクトID
- **取得方法**: Vercel CLI で `vercel link` 実行後、`.vercel/project.json` から取得

## Vercel設定

### 自動デプロイの場合（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard) でプロジェクトを作成
2. GitHubリポジトリを連携
3. 環境変数を設定（Settings > Environment Variables）:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - その他プロジェクト固有の環境変数

### 手動デプロイの場合

上記のVERCEL関連のGitHub Secretsを設定し、deploy.ymlのコメントアウト部分を有効化してください。

## 環境変数設定

### ローカル開発用（`.env.local`）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# その他プロジェクト固有の環境変数
# NEXT_PUBLIC_API_URL=...
```

### 本番環境用（Vercel）

Vercelダッシュボードで同じ環境変数を設定してください。

## トラブルシューティング

### デプロイが失敗する場合

1. **Secrets の確認**: すべての必須Secretsが正しく設定されているか確認
2. **Supabaseトークンの権限**: アクセストークンに適切な権限があるか確認
3. **環境変数**: Vercelの環境変数が正しく設定されているか確認
4. **ビルドエラー**: GitHub Actions のログでビルドエラーがないか確認

### 型生成に失敗する場合

1. Supabaseプロジェクトが正しく設定されているか確認
2. データベーススキーマに構文エラーがないか確認
3. `SUPABASE_PROJECT_REF` が正しいかダブルチェック

## サポート

問題が発生した場合は、GitHub Issues で報告してください。
