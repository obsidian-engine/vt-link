"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Target, TrendingUp } from "lucide-react"

export default function AudiencePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">オーディエンス管理</h1>
          <p className="text-muted-foreground">
            セグメント作成、タグ付け、属性管理
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          セグメント作成
        </Button>
      </div>

      {/* Audience Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総友だち数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,340</div>
            <p className="text-xs text-muted-foreground">+180 今月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,920</div>
            <p className="text-xs text-muted-foreground">72.3% 全体の</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">セグメント数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">8個 アクティブ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新規登録</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </CardContent>
        </Card>
      </div>

      {/* Segments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>オーディエンスセグメント</CardTitle>
              <CardDescription>
                ターゲット別のオーディエンス管理
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              セグメント編集
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">VIPファン</h3>
                  <span className="text-sm text-muted-foreground">1,234人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  高エンゲージメント・購入履歴あり
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">配信</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">新規ファン</h3>
                  <span className="text-sm text-muted-foreground">3,456人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  登録30日以内の新しいファン
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">配信</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">ライブ参加者</h3>
                  <span className="text-sm text-muted-foreground">2,890人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  過去3ヶ月のライブ参加履歴あり
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">配信</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">休眠ユーザー</h3>
                  <span className="text-sm text-muted-foreground">1,567人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  30日以上アクティビティなし
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">復帰策</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">グッズ購入者</h3>
                  <span className="text-sm text-muted-foreground">890人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  過去6ヶ月のグッズ購入履歴
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">配信</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">全体</h3>
                  <span className="text-sm text-muted-foreground">12,340人</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  すべてのLINE友だち
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">詳細</Button>
                  <Button variant="ghost" size="sm">配信</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}