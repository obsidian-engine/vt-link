"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とプリファレンスの管理
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>
            LINEアカウントの基本情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                placeholder="チャンネル名"
                defaultValue="長月 朔（サンプル）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">タイムゾーン</Label>
              <Select defaultValue="asia-tokyo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="america-new-york">America/New_York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">プロフィール説明</Label>
            <Textarea
              id="description"
              placeholder="アカウントの説明を入力..."
              defaultValue="VTuber活動をしている長月朔です。ゲーム配信やイベント情報をお届けします！"
            />
          </div>

          <div className="space-y-2">
            <Label>プロフィール画像</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                SA
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                画像をアップロード
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>
            配信やシステムの通知設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>配信完了通知</Label>
              <p className="text-sm text-muted-foreground">
                メッセージ配信が完了したときに通知
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>エラー通知</Label>
              <p className="text-sm text-muted-foreground">
                配信エラーやシステムエラーが発生したときに通知
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>週次レポート</Label>
              <p className="text-sm text-muted-foreground">
                毎週の配信統計レポートをメールで受信
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>新機能の通知</Label>
              <p className="text-sm text-muted-foreground">
                新機能やアップデート情報を受信
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>セキュリティ</CardTitle>
          <CardDescription>
            アカウントのセキュリティ設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>二段階認証</Label>
              <p className="text-sm text-muted-foreground">
                SMS認証でアカウントセキュリティを強化
              </p>
            </div>
            <Button variant="outline" size="sm">
              設定
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API設定</CardTitle>
          <CardDescription>
            LINE Messaging APIの設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="channelId">チャンネルID</Label>
            <Input
              id="channelId"
              placeholder="1234567890"
              defaultValue="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channelSecret">チャンネルシークレット</Label>
            <Input
              id="channelSecret"
              type="password"
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">アクセストークン</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> APIキーは安全に管理してください。第三者と共有しないでください。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          設定を保存
        </Button>
      </div>
    </div>
  )
}