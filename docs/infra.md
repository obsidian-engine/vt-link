✅ **結論（先に）******

**はい、いけます。** 提案した構成（**Vercel Hobby + Cloudflare Workers（Cron）+ 無料のPostgres（Neon/Supabase）+ LINE Developer**）なら、**独自ドメインを使わず**に *.vercel.app で公開すれば**完全無料**で運用できます。

※ ただし各サービスの**無料枠の上限内**（帯域・実行時間・DB容量・メッセージ数など）に収まることが条件です。上限やポリシーは変わる可能性があるので、各ダッシュボードの現在値で最終確認してください。

* * *

✅ **無料で成立させるためのチェックリスト******

**これ全部 "Yes" なら 0円でいけます。******

1. **ドメイン**：独自ドメインは使わず、**<project>.vercel.app** を使う。

2. **フロント & API（Go）**：**Vercel Hobby** 上で

  - Next.js をホスト

  - **/api/** に **Go Serverless Functions** を配置

  - 1リクエストあたりの実行時間・メモリを無料枠内に収める（重いバッチは置かない）

3. **DB**：**Neon/Supabase の Free Postgres** を使用

  - ストレージ・接続回数・スループットが無料枠内

  - 初回スリープからの復帰を許容（接続リトライを実装）

4. **スケジューラ（予約送信）**：**Cloudflare Workers（Cron）** を使う

  - 毎分〜数分おきに **Vercelの /api/scheduler/run** を叩くだけの小処理

  - 1日の実行回数が Workers Free の範囲内

5. **メッセージ送信**：**LINE Messaging API（Developer枠）******

  - **無料通数の範囲**（個人運用なら通常OK）

6. **画像/ファイル**：最初は **Vercelの静的配信**でOK

  - 帯域/容量が増えたら **Cloudflare R2 / Images（Free枠）** に避難

7. **CI/CD**：GitHub → Vercel（自動デプロイ）

  - 必要なら GitHub Actions も無料枠内で使用（型生成・Lint程度）
* * *

✅ **想定している"落ちない"運用パターン******

- 告知テキスト＋静止画像中心（大容量配信なし）
- 配信本数：**1人運用の告知頻度**で、**1,000通/月**以内（目安）
- 予約送信：**毎分ポーリング**でも Workers Free の範囲内に収まる規模
- APIは**短時間で終了**（DBクエリ軽め、外部APIはLINE程度）
* * *

✅ **無料のまま維持するための運用Tips******

- **画像は軽量化**（WebP / 低解像度サムネ）→ 帯域節約
- **送信履歴を短く保持** or アーカイブ → DB容量節約
- **Schedulerは最小I/O**（対象IDだけ取得→即送信）→ 実行時間短縮
- 負荷が上がったら **送信を分割（バッチ）** し、**リトライ/レート制御**を入れる
- 将来有料化が必要になったら

  - 画像：R2/Imagesへ

  - DB：上位プラン or マネージドDBへ

  - Cron：Workers Paid or Upstash/QStash 等へ
* * *

✅ **次にやること（最短ルート）******

1. **Neon/Supabase** で DB 作成 → **DATABASE_URL** を Vercel に設定

2. /api/scheduler/run（Go）を追加（scheduled_at <= now を送信）

3. **Cloudflare Worker**（Cron）を作成し、**毎分**で /api/scheduler/run を叩く

4. **Zod → OpenAPI → 型生成**（pnpm gen）を回してフロントにつなぐ

5. 実際に **作成 → 予約 → 自動送信** の一連を動作確認
* * *