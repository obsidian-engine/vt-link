✅ **コンテキスト / 前提 / ゴール******

**目的**：Next.js（React）フロントを、**スキーマ→型生成→型安全クライアント**の流れで実装・運用できるようにする。

**前提**：モノレポ構成（apps/frontend、packages/api-client、packages/schema-zod）。型は **OpenAPI（Zod生成物）→ openapi-typescript** で生成、通信は **openapi-fetch** を使用。
* * *

# **✅ フロントエンド実装・運用 手順書（Next.js 15 / SWR / 型生成）**



> **結論先取り**：

1. > 依存を入れる → 2) .env 用意 → 3) pnpm gen で型生成 → 4) **Prismモック or 実API**を叩いて開発 → 5) SWR + openapi-fetch で型安全に実装 → 6) CIで品質チェック。
* * *

## **✅ 1. 必要ツール & 最初のセットアップ**



**前提ツール******

- Node.js 20系（corepack enable 済）
- pnpm 9系
- （任意：Prism モック）@stoplight/prism-cli



**初期化（ルートで実行）**


    corepack enable
    pnpm i -w

**ワークスペース確認******

- pnpm-workspace.yaml に apps/* と packages/* が含まれていること
- すでに用意済みの以下を前提にする

    - packages/schema-zod（Zod → OpenAPI 生成）

    - packages/api-client（OpenAPI → TS型生成 & クライアント）
* * *

## **✅ 2. 環境変数の準備（フロント）**



**apps/frontend/.env.development（ローカル用）**


    # 実APIを叩く場合
    NEXT_PUBLIC_API_BASE=http://localhost:8080
    # Prismモックを使う場合（後述）
    # NEXT_PUBLIC_API_BASE=http://localhost:4010

**apps/frontend/.env.production（本番ビルド用）**


    NEXT_PUBLIC_API_BASE=https://vt-line.example.com

> **重要**：**NEXT_PUBLIC_** で始まるキーのみがブラウザに露出。**必ず https/ドメインを正確に**。
* * *

## **✅ 3. スキーマから型を作る（自動生成）**



**ルート package.json のスクリプト（既定）**


    {
      "scripts": {
        "gen:openapi": "pnpm -C packages/schema-zod gen:openapi",
        "gen:types": "pnpm -C packages/api-client gen",
        "gen": "pnpm gen:openapi && pnpm gen:types",
        "build": "pnpm gen && pnpm -C apps/frontend build"
      }
    }

**型生成の実行**


    pnpm gen           # Zod -> OpenAPI -> Types を一括生成

> **コツ**：**毎回のビルド前に自動生成**されるよう build に pnpm gen を入れています。

> **差分必須レビュー**：packages/api-client/src/__generated__/types.ts の差分はPRで必ず確認。

* * *

## **✅ 4. 開発サーバ起動（2パターン）**



### **4.1 実API（Go/Echo）を叩く**


    # 別タブA：DB
    docker compose -f infra/docker/compose.local.yml up -d
    # 別タブB：バックエンド
    cd apps/backend && air   # or go run ./cmd/server
    # 別タブC：フロント
    cd apps/frontend && pnpm dev -p 3000

- NEXT_PUBLIC_API_BASE=http://localhost:8080 にしておく



### **4.2 Prism モックAPIを叩く（E2Eの早期化に有効）**


    # モック起動（4010番）
    npx @stoplight/prism-cli mock packages/schema-zod/openapi.yaml --port 4010
    # フロント
    cd apps/frontend && pnpm dev -p 3000

- .env.development を http://localhost:4010 にしておく
* * *

## **✅ 5. 型安全クライアントの使い方（openapi-fetch）**



**依存関係（既に packages/api-client に含まれる）******

- openapi-fetch（通信）
- openapi-typescript（型生成）



**インポート（ページやフックで）**


    import { makeClient } from '@vt/api-client/src/client'
    const client = makeClient() // NEXT_PUBLIC_API_BASE を自動参照

**GET（SWRとの併用）**


    'use client'
    import useSWR from 'swr'
    import { makeClient } from '@vt/api-client/src/client'
    
    const client = makeClient()
    
    export default function Page() {
      const { data, error, isLoading, mutate } = useSWR(
        ['/api/v1/campaigns','listCampaigns'],
        async () => {
          const res = await client.GET('/api/v1/campaigns')
          if (res.error) throw res.error
          return res.data   // 型: { ok: boolean; data: Campaign[] }
        }
      )
    
      return (
        <main className="space-y-6">
          <h1 className="text-2xl font-bold">VT-Line Dashboard</h1>
          <button className="rounded border px-3 py-1.5" onClick={() => mutate()}>
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
          {error && <p className="text-red-600">Error: {String(error)}</p>}
          <ul className="divide-y rounded-lg border bg-white">
            {data?.data?.map((c) => (
              <li key={c.id} className="p-4">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-gray-600">{c.body}</p>
              </li>
            )) ?? <li className="p-4 text-gray-600">No data</li>}
          </ul>
        </main>
      )
    }

**POST（作成API + 楽観的更新例）**


    import { makeClient } from '@vt/api-client/src/client'
    const client = makeClient()
    
    export async function createCampaign(input: {
      title: string; body: string; imageUrl?: string | null; scheduledAt?: string | null; status?: 'draft'|'scheduled'|'sent'
    }) {
      const res = await client.POST('/api/v1/campaigns', { body: input })
      if (res.error) throw res.error
      return res.data  // { ok: boolean; data: Campaign }
    }
    
    /* SWRの楽観的更新例
    const { data, mutate } = useSWR(...)
    
    await mutate(async (current) => {
      const created = await createCampaign(form)
      return { ...current, data: [created.data, ...(current?.data ?? [])] }
    }, { revalidate: false })
    */

> **注意**：openapi-fetch では res.error を必ず確認。

> 型は **OpenAPI生成**に準拠するため、**バックエンドの変更を即検知**できます。

* * *

## **✅ 6. フォーム実装（Zodを使った入力検証）**



**選択肢******

- **軽量**：zod + 手書きフォーム
- **実戦的**：react-hook-form + @hookform/resolvers/zod



**例：react-hook-form + zod**


    // apps/frontend/app/campaign/new/useCreateCampaignForm.ts
    'use client'
    import { useForm } from 'react-hook-form'
    import { z } from 'zod'
    import { zodResolver } from '@hookform/resolvers/zod'
    
    const schema = z.object({
      title: z.string().min(1, 'タイトルは必須です'),
      body: z.string().min(1, '本文は必須です'),
      imageUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
      scheduledAt: z.string().datetime().optional()
    })
    
    export type FormValues = z.infer<typeof schema>
    
    export function useCreateCampaignForm() {
      return useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { title: '', body: '' } })
    }
    
    
    // apps/frontend/app/campaign/new/page.tsx
    'use client'
    import { useCreateCampaignForm } from './useCreateCampaignForm'
    import { createCampaign } from '@/lib/repo' // さきほどのPOST例を関数化しておく
    
    export default function NewCampaignPage() {
      const { register, handleSubmit, formState: { errors, isSubmitting } } = useCreateCampaignForm()
    
      return (
        <form
          className="space-y-4 max-w-2xl"
          onSubmit={handleSubmit(async (v) => {
            await createCampaign(v)
            // 成功時の遷移など
          })}
        >
          <div>
            <label className="block text-sm font-medium">タイトル</label>
            <input className="mt-1 w-full rounded border px-3 py-2" {...register('title')} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">本文</label>
            <textarea className="mt-1 w-full rounded border px-3 py-2" rows={6} {...register('body')} />
            {errors.body && <p className="text-sm text-red-600">{errors.body.message}</p>}
          </div>
          <button className="rounded border px-4 py-2" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Create'}
          </button>
        </form>
      )
    }

> **発展**：**Zodの定義を packages/schema-zod から共有**して、**同じバリデーション**をクライアントでも使えます（**ランタイム**でも同じルール）。

* * *

## **✅ 7. 状態管理の方針（SWR + Zustand）**
- **SWR**：リモートソース（API）の**キャッシュ** & **再検証******
- **Zustand**：フォームやビュー状態など**ローカルUI状態******
- **原則**：「サーバーの真実＝SWR」「UIの一時状態＝Zustand」



**Zustand最小例**


    // apps/frontend/lib/store.ts
    import { create } from 'zustand'
    
    type UIState = { sidebarOpen: boolean; setOpen: (v: boolean) => void }
    export const useUI = create<UIState>((set) => ({
      sidebarOpen: false,
      setOpen: (v) => set({ sidebarOpen: v }),
    }))

* * *

## **✅ 8. 品質ゲート（フロント観点）**

- **型生成差分のレビュー必須**：

    - packages/api-client/src/__generated__/types.ts を Git 管理

    - CI で **未コミット差分が出たら失敗**
- **Prismモックへのスモークテスト**（CIで可）

    - .env.development を 4010 に切替 → curl で疎通
- **Lighthouse** / **Next.js Analyzer**（必要に応じて）
- **ESLint / TypeCheck / Vitest**（最低限）
* * *

## **✅ 9. よくある落とし穴（チェックリスト）**

- **BASE URLの二重スラッシュ**：NEXT_PUBLIC_API_BASE は末尾スラなし推奨（https://...）
- **CORS**：本番はCaddyで同一オリジン配信（/apiはリバースプロキシ）→ CORS回避
- **operationId の変更**：OpenAPIの operationId が変わると **型の呼び出し箇所**に影響
- **エラー処理**：openapi-fetch の res.error を必ず確認
- **SWRキー**：['/path', 'operationId', params] など**一意性**を保つ
- **Optimistic Update**：失敗時のロールバック（mutate の引数や rollbackOnError を活用）
* * *

## **✅ 10. 仕上げ（本番ビルド）**


    # 型生成 → フロントビルド
    pnpm gen
    pnpm -C apps/frontend build

**本番実行（Compose経由／参照）******

- infra/docker/compose.prod.yml で frontend サービスが NEXT_PUBLIC_API_BASE を参照
- Caddy が /api/* を backend:8080 にプロキシ
* * *

## **✅ 11. 参考コマンド早見表**


    # 型生成（Zod→OpenAPI→Types）
    pnpm gen
    
    # Prismモック起動（ポート4010）
    npx @stoplight/prism-cli mock packages/schema-zod/openapi.yaml --port 4010
    
    # 開発サーバ
    pnpm -C apps/frontend dev
    
    # 本番ビルド
    pnpm -C apps/frontend build

* * *

## **✅ 12. 次アクション提案**

1. **apps/frontend に上記サンプル（一覧/作成）ページを追加******

2. **フォームのZodを packages/schema-zod 由来に統一**（単一ソース徹底）

3. **SWR用の useCampaigns() / useCreateCampaign() カスタムフック**を分離

4. **Prismモックを使ったCIスモーク**を有効化して、**回帰を即検知**

* * *