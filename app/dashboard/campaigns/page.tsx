import { getCampaigns } from '@/ui/actions/campaignActions';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCampaigns } from '@/ui/actions/campaignActions';

// キャンペーンのステータス型
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

// キャンペーンのタイプ型  
type CampaignType = 'broadcast' | 'narrowcast';

// キャンペーンデータの型定義
interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  estimatedRecipients?: number;
  scheduledAt?: string | Date;
  sentCount?: number;
  sentAt?: string | Date;
  createdAt: string | Date;
}

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ← ダッシュボード
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📤 メッセージ配信キャンペーン
              </h1>
            </div>
            <Link
              href="/dashboard/campaigns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + 新規キャンペーン作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<CampaignListSkeleton />}>
            <CampaignList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function CampaignList() {
  // 実際のアプリケーションでは認証からaccountIdを取得
  const accountId = 'demo-account-id';
  const result = await getCampaigns(accountId);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">エラーが発生しました: {result.error}</div>
      </div>
    );
  }

  const campaigns = result.data;

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          まだキャンペーンが作成されていません
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          最初のキャンペーンを作成
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* フィルター・検索エリア */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべてのステータス</option>
              <option value="draft">下書き</option>
              <option value="scheduled">予約済み</option>
              <option value="sending">送信中</option>
              <option value="sent">送信完了</option>
              <option value="failed">送信失敗</option>
            </select>
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべてのタイプ</option>
              <option value="broadcast">一斉配信</option>
              <option value="narrowcast">セグメント配信</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="キャンペーン名で検索..."
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      {/* キャンペーン一覧 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">キャンペーン一覧</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {campaigns?.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            下書き
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            予約済み
          </span>
        );
      case 'sending':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            送信中
          </span>
        );
      case 'sent':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            送信完了
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            送信失敗
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'broadcast' ? '📢' : '🎯';
  };

  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`}>
      <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {campaign.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  {getStatusBadge(campaign.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.type === 'broadcast'
                      ? '全ユーザー'
                      : `${campaign.estimatedRecipients || 0}名`}
                  </span>
                  {campaign.scheduledAt && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      配信予定: {new Date(campaign.scheduledAt).toLocaleString('ja-JP')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {campaign.sentCount !== undefined && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                送信数: {campaign.sentCount.toLocaleString()}
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {campaign.status === 'sent' && campaign.sentAt
                ? `完了: ${new Date(campaign.sentAt).toLocaleDateString('ja-JP')}`
                : `作成: ${new Date(campaign.createdAt).toLocaleDateString('ja-JP')}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CampaignListSkeleton() {
  return (
    <div className="space-y-6">
      {/* フィルター・検索エリアのスケルトン */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>

      {/* キャンペーン一覧のスケルトン */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div>
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                      <div className="flex items-center space-x-4">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
