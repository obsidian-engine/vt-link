import { Suspense } from 'react';
import Link from 'next/link';
import { CreateCampaignForm } from '@/ui/components/campaign/CreateCampaignForm';

export default function NewCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/campaigns"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ← キャンペーン一覧
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ➕ 新規キャンペーン作成
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<CreateCampaignFormSkeleton />}>
            <CreateCampaignForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function CreateCampaignFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* キャンペーン基本情報 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 配信設定 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* メッセージ内容 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="flex justify-end space-x-4">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    </div>
  );
}