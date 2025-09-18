✅ **VT-Line -- バックエンド実装・運用 手順書（Go 1.24 / Echo / Layered）******
* * *

## **✅ コンテキスト / ゴール / 原則**

- **目的**：Go 1.24 / Echo のバックエンドを**レイヤードアーキテクチャ**で実装・運用し、**ローカル開発 → 本番デプロイ**まで一貫手順を提供。
- **原則**：**Presentation → Application → Domain ← Infrastructure** の依存方向を厳守。ユースケース中心、外部I/Oはインターフェースで抽象化。
- **前提**：本モノレポ構成（apps/backend ほか）、DBは Postgres（Docker）、スキーマは Zod → OpenAPI 生成（/openapi.yaml を配信）。
* * *

## **✅ ディレクトリ構成（Backend）**


    apps/backend/
    ├─ cmd/server/                   # エントリ（DI・起動）
    │   └─ main.go
    ├─ internal/
    │   ├─ presentation/http/        # Echoルータ/ハンドラ
    │   │   ├─ router.go
    │   │   ├─ openapi_handler.go
    │   │   └─ campaign_handler.go
    │   ├─ application/campaign/     # ユースケース（インタラクタ）
    │   │   ├─ usecase.go
    │   │   └─ interactor.go
    │   ├─ domain/                   # エンティティ/リポジトリIF
    │   │   ├─ model/campaign.go
    │   │   └─ repository/campaign_repo.go
    │   ├─ infrastructure/           # 具象（DB/外部API）
    │   │   ├─ db/conn.go
    │   │   └─ db/pg/
    │   │       ├─ campaign_repo.go
    │   │       └─ tx.go
    │   │   └─ external/line_pusher.go  # 任意（LINE Push 実装）
    │   ├─ shared/                   # 横断（Clock/Err等）
    │   │   ├─ clock/clock.go
    │   │   └─ errx/errs.go
    │   └─ migrations/0001_init.sql  # goose
    └─ go.mod

* * *

## **✅ 事前要件（ローカル）**

- **Go**: 1.24
- **Docker / Docker Compose**（DB用）
- **Postgres**: Docker で起動（infra/docker/compose.local.yml）
- **goose**（DBマイグレーション）, **air**（ホットリロード）

    - go install github.com/pressly/goose/v3/cmd/goose@latest

    - go install github.com/air-verse/air@latest
* * *

## **✅ 環境変数（Backend）**



apps/backend/.env（例）


    DB_URL=postgres://vtline:vtlinepass@localhost:5432/vtline?sslmode=disable
    JWT_SECRET=CHANGE_ME_32CHARS_MIN
    LINE_CHANNEL_ID=
    LINE_CHANNEL_SECRET=
    LINE_ACCESS_TOKEN=
    PORT=8080

**重要**：本番は db:5432（Compose 内）を参照。**秘密情報は Secrets 管理**。

* * *

## **✅ データベース（起動・マイグレーション）**

1. **DB 起動（ローカル）**


    docker compose -f infra/docker/compose.local.yml up -d

2. **マイグレーション**


    export DB_URL="postgres://vtline:vtlinepass@localhost:5432/vtline?sslmode=disable"
    cd apps/backend
    goose -dir ./migrations postgres "$DB_URL" up

> **Tip**：本番はデプロイ前後に CI/CD から goose up を実行するか、起動スクリプトで自動化。

* * *

## **✅ ローカル開発（ホットリロード）**


    # 別タブA: DB（上記のとおり）
    # 別タブB: Backend（air）
    cd apps/backend && air
    # 健康確認
    curl -sf http://localhost:8080/healthz

- **/healthz** は DB Ping まで実施（200 で正常）
* * *

## **✅ レイヤー別 実装要点**

- **Domain******

    - model.Campaign / CampaignStatus、**ビジネスルール**（例：CanSend）を配置

    - repository.CampaignRepository：**抽象**（Interface）だけ定義
- **Application******

    - Usecase（InputPort）と interactor（実装）

    - 依存：CampaignRepository、Pusher（LINE 抽象）、Clock、TxManager
- **Infrastructure******

    - db.pg.CampaignRepo（sqlx で実装）

    - db.pg.TxManager（WithinTx(ctx, fn)）

    - external.LinePusher（PushText(ctx, text) など）
- **Presentation******

    - campaign_handler（Echo Handler）

    - ルーティングは /api/v1/campaigns、/openapi.yaml を配信
* * *

## **✅ API ルーティング（最小）**

- GET /api/v1/campaigns：一覧（100件まで）
- POST /api/v1/campaigns：作成（title/body 必須）
- POST /api/v1/campaigns/:id/send：即時送信（LINE Push → status=sent）
- GET /healthz：DB Ping を含むヘルスチェック
- GET /openapi.yaml：**Zod生成の OpenAPI** を配信（packages/schema-zod/openapi.yaml）
* * *

## **✅ Zod → OpenAPI 連携（参照）**

- ルートで pnpm gen を実行 → packages/schema-zod/openapi.yaml 生成
- バックエンドはこのファイルを **静的配信**（Echo）


    // internal/presentation/http/openapi_handler.go
    e.GET("/openapi.yaml", func(c echo.Context) error {
      return c.File("packages/schema-zod/openapi.yaml")
    })

-
- フロントは openapi-fetch + 生成型で呼び出し（型安全）
* * *

## **✅ LINE Push（Pusher 抽象と実装）**

- **Application** は Pusher インターフェースに依存（送信処理の抽象）
- **Infrastructure** に external.LinePusher を実装

    - POST https://api.line.me/v2/bot/message/push

    - ヘッダ Authorization: Bearer ${LINE_ACCESS_TOKEN}

    - **本番運用**：送信失敗時のリトライ/ロギングを実装、レート制御考慮
- **ローカル**は dummyPusher（No-op）で差し替え可能
* * *

## **✅ スケジューラ（単発実行 & 将来拡張）**

- **Usecase**：RunSchedulerOnce(ctx, now, max) を提供
- **処理**：scheduled_at <= now AND status='scheduled' を抽出 → SendNow
- **運用**：

    - ローカル：curl -X POST /api/v1/admin/scheduler/run-once（任意エンドポイント）

    - 本番：**別コンテナの cron**（または watchtower 系）や **Systemd timer** で定期叩き
- **将来**：ワーカー分離（CQRS）や Queue 導入も容易
* * *

## **✅ テスト / 品質**

- **ユニット**：Application は Repo/Pusher/Clock/Tx を **モック**化して高速テスト
- **結合**：Infrastructure（PG Repo）は docker Postgres に向けて sqlx 実クエリ検証
- **E2E**：Echo ハンドラを httptest で実行し、Usecase フェイク差し替え
- **静的解析**：golangci-lint（推奨）／ **CI** で実行
- **OpenAPI Lint**（Spectral）：フロント手順書の CI に統合済み
* * *

## **✅ ビルド / 実行**



### **ローカルビルド**


    cd apps/backend
    go build ./cmd/server
    ./server

### **Docker ビルド（本番）**



infra/docker/backend.Dockerfile（Go 1.24 / distroless）


    docker build -f infra/docker/backend.Dockerfile -t vtline-backend:latest .

* * *

## **✅ 本番デプロイ（Compose + Caddy）**

1. **サーバ準備**：VPS / DNS / 80・443 開放、Docker & Compose 導入

2. **環境変数**：apps/backend/.env を配置（DB_URL=postgres://vtline:vtlinepass@db:5432/...）

3. **起動**


    cd infra/docker
    docker compose -f compose.prod.yml up -d --build

4. **確認**


    curl -sf https://vt-line.example.com/healthz
    curl -sf https://vt-line.example.com/openapi.yaml

- **Caddy** が自動で TLS 証明書取得
- **/api/** は backend:8080 にプロキシ
* * *

## **✅ 運用（運用コマンド / バックアップ / 監視）**

- **ログ**


    docker compose -f infra/docker/compose.prod.yml logs -f backend

- **DB バックアップ（日次）**


    docker exec vtline-db pg_dump -U vtline vtline | gzip > /var/backups/vtline/pgdump-$(date +%F).sql.gz

- **ヘルス**：/healthz を UptimeRobot 等で監視
- **リソース**：docker stats / Caddy のアクセスログ（JSON）
* * *

## **✅ セキュリティ / 信頼性**

- **JWT_SECRET** は 32+ 文字乱数、**Secrets 管理**（Gitに載せない）
- **DB**：外部公開しない（Compose 内ネットワーク限定）
- **依存更新**：go get -u と docker image prune -f を CI で定期実行
- **レート制御/リトライ**：LINE Push 実装で考慮
- **監査ログ**：送信履歴（成功/失敗/レスポンス）を DB に記録（将来の分析に活用）
* * *

## **✅ トラブルシューティング（早見表）**

- **/healthz が 500**：DB 接続不可 → DB_URL / DB 起動確認、セキュリティグループ/ポート
- **/openapi.yaml 404**：モノレポ内の相対パス誤り → Echo の File() パス見直し
- **CORS**：本番は同一オリジン（Caddyプロキシ）で回避。ローカル別オリジンの場合は Echo に CORS ミドルウェア追加
- **送信失敗**：LINE トークン権限・レート超過・JSON 形式チェック、失敗時ログ必須
* * *

## **✅ 参考コマンド（まとめ）**


    # DB 起動（dev）
    docker compose -f infra/docker/compose.local.yml up -d
    
    # マイグレーション
    export DB_URL="postgres://vtline:vtlinepass@localhost:5432/vtline?sslmode=disable"
    cd apps/backend && goose -dir ./migrations postgres "$DB_URL" up
    
    # 開発サーバ（ホットリロード）
    cd apps/backend && air
    
    # 本番起動（Caddy + FE + BE + DB）
    cd infra/docker && docker compose -f compose.prod.yml up -d --build
    
    # 健康確認
    curl -sf https://vt-line.example.com/healthz

* * *

## **✅ 次アクション（おすすめ）**

1. **LINE Pusher の実装**（infrastructure/external/line_pusher.go）を本番用に置き換え

2. **Scheduler エンドポイント**（管理用）と **Systemd timer** / **Cron コンテナ**の組込み

3. **golangci-lint / unit test** の CI 導入（PR 時に必須）

4. **送信結果の監査ログ**と**再送リトライ方針**を定義 → **分析拡張**へ接続

* * *