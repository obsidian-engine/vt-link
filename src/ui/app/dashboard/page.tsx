import { Suspense } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎭 VTube LINE Manager
            </h1>
            <nav className="flex space-x-8">
              <Link 
                href="/dashboard/rich-menu" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                リッチメニュー
              </Link>
              <Link 
                href="/dashboard/auto-reply" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                自動返信
              </Link>
              <Link 
                href="/dashboard/messages" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                メッセージ配信
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              title="リッチメニュー"
              description="ドラッグ&ドロップでメニューを作成"
              icon="🎨"
              href="/dashboard/rich-menu"
              stats="0 個作成済み"
            />
            
            <DashboardCard
              title="自動返信Bot"
              description="キーワードに基づく自動応答"
              icon="🤖"
              href="/dashboard/auto-reply"
              stats="0 ルール設定済み"
            />
            
            <DashboardCard
              title="メッセージ配信"
              description="一斉配信・予約配信対応"
              icon="📤"
              href="/dashboard/messages"
              stats="0 件送信済み"
            />
            
            <DashboardCard
              title="分析・レポート"
              description="メッセージ効果を可視化"
              icon="📊"
              href="/dashboard/analytics"
              stats="準備中"
            />
            
            <DashboardCard
              title="設定"
              description="LINE公式アカウント設定"
              icon="⚙️"
              href="/dashboard/settings"
              stats="未設定"
            />
          </div>
          
          <div className="mt-8">
            <Suspense fallback={<div>読み込み中...</div>}>
              <QuickActions />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  stats: string;
}

function DashboardCard({ title, description, icon, href, stats }: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {title}
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          クイックアクション
        </h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            label="新しいリッチメニュー"
            icon="➕"
            href="/dashboard/rich-menu/new"
          />
          <QuickActionButton
            label="返信ルール追加"
            icon="🔧"
            href="/dashboard/auto-reply/new"
          />
          <QuickActionButton
            label="メッセージ送信"
            icon="📨"
            href="/dashboard/messages/new"
          />
          <QuickActionButton
            label="設定を確認"
            icon="⚙️"
            href="/dashboard/settings"
          />
        </div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  label: string;
  icon: string;
  href: string;
}

function QuickActionButton({ label, icon, href }: QuickActionButtonProps) {
  return (
    <Link href={href}>
      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
        <span className="text-xl mr-3">{icon}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
      </div>
    </Link>
  );
}