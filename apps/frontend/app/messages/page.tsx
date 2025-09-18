"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Send, Clock, Users } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">メッセージ管理</h1>
          <p className="text-muted-foreground">
            配信用テンプレートやスケジュールの管理
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新規メッセージ
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配信済み</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">今月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配信予定</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">スケジュール済み</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総リーチ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,340</div>
            <p className="text-xs text-muted-foreground">アクティブユーザー</p>
          </CardContent>
        </Card>
      </div>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>メッセージテンプレート</CardTitle>
              <CardDescription>
                よく使用されるメッセージの一覧
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              テンプレート追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template Items */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <h3 className="font-semibold mb-2">新商品告知</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  新しい商品やサービスの告知用テンプレート
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">編集</Button>
                  <Button variant="ghost" size="sm">複製</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <h3 className="font-semibold mb-2">イベント招待</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ライブやイベントの招待メッセージ
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">編集</Button>
                  <Button variant="ghost" size="sm">複製</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <h3 className="font-semibold mb-2">セール通知</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  期間限定セールやキャンペーンの告知
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">編集</Button>
                  <Button variant="ghost" size="sm">複製</Button>
                </div>
              </div>

              <div className="rounded-lg border border-white/30 bg-white/30 p-4 hover:bg-white/40 transition-colors">
                <h3 className="font-semibold mb-2">感謝メッセージ</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ファンへの感謝や特別なお知らせ
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">編集</Button>
                  <Button variant="ghost" size="sm">複製</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>配信履歴</CardTitle>
          <CardDescription>
            最近配信されたメッセージ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
              <div className="space-y-1">
                <p className="font-medium">夏のセール開始のお知らせ</p>
                <p className="text-sm text-muted-foreground">2024年7月15日 10:00配信</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">配信数: 12,340</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/15 text-green-700">
                  配信完了
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
              <div className="space-y-1">
                <p className="font-medium">新スタンプリリース</p>
                <p className="text-sm text-muted-foreground">2024年7月12日 14:30配信</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">配信数: 11,890</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/15 text-green-700">
                  配信完了
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-white/30 bg-white/20">
              <div className="space-y-1">
                <p className="font-medium">限定ライブ配信告知</p>
                <p className="text-sm text-muted-foreground">配信予定: 2024年7月20日 18:00</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">対象: 8,500人</span>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-500/15 text-blue-700">
                  配信予定
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}