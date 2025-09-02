import type { DeliveryHistory } from '@/types/dashboard.types';
import { getCampaignHistory } from '@/ui/actions/campaignActions';
import Link from 'next/link';
import { Suspense } from 'react';

export default function HistoryPage() {
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
                📊 配信履歴・分析
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<HistoryListSkeleton />}>
            <HistoryContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function HistoryContent() {
  // 実際のアプリケーションでは認証からaccountIdを取得
  const accountId = 'demo-account-id';
  const result = await getCampaignHistory(accountId);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">エラーが発生しました: {result.error}</div>
      </div>
    );
  }

  const { campaigns, totalCount } = result.data ?? {
    campaigns: [],
    totalCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    総配信数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalCount.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    成功配信
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {campaigns
                      .reduce((sum: number, c: DeliveryHistory) => sum + (c.sentCount || 0), 0)
                      .toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    失敗配信
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {campaigns
                      .reduce((sum: number, c: DeliveryHistory) => sum + (c.failedCount || 0), 0)
                      .toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    成功率
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {campaigns.length > 0
                      ? Math.round(
                          (campaigns.reduce(
                            (sum: number, c: DeliveryHistory) => sum + (c.sentCount || 0),
                            0
                          ) /
                            (campaigns.reduce(
                              (sum: number, c: DeliveryHistory) =>
                                sum + (c.sentCount || 0) + (c.failedCount || 0),
                              0
                            ) || 1)) *
                            100
                        )
                      : 0}
                    %
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フィルター・検索エリア */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべての期間</option>
              <option value="today">今日</option>
              <option value="week">過去1週間</option>
              <option value="month">過去1ヶ月</option>
              <option value="quarter">過去3ヶ月</option>
            </select>
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべてのタイプ</option>
              <option value="broadcast">一斉配信</option>
              <option value="narrowcast">セグメント配信</option>
            </select>
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべてのステータス</option>
              <option value="sent">送信完了</option>
              <option value="failed">送信失敗</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="キャンペーン名で検索..."
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">まだ配信履歴がありません</div>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            最初のキャンペーンを作成
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">配信履歴一覧</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    キャンペーン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    配信日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    配信数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    成功率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">アクション</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign: DeliveryHistory) => (
                  <HistoryRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({ campaign }: { campaign: DeliveryHistory }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
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
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'broadcast' ? '📢' : '🎯';
  };

  const totalSent = (campaign.sentCount || 0) + (campaign.failedCount || 0);
  const successRate = totalSent > 0 ? Math.round(((campaign.sentCount || 0) / totalSent) * 100) : 0;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg mr-3">{getTypeIcon(campaign.type)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ID: {campaign.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {campaign.sentAt ? new Date(campaign.sentAt).toLocaleString('ja-JP') : '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {campaign.type === 'broadcast' ? '一斉配信' : 'セグメント配信'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium text-green-600 dark:text-green-400">
            {(campaign.sentCount || 0).toLocaleString()}
          </span>
          {campaign.failedCount && campaign.failedCount > 0 && (
            <span className="text-red-600 dark:text-red-400 ml-2">
              (+{campaign.failedCount.toLocaleString()}失敗)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          合計: {totalSent.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          <span
            className={`font-medium ${
              successRate >= 95
                ? 'text-green-600 dark:text-green-400'
                : successRate >= 90
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {successRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
          <div
            className={`h-1.5 rounded-full ${
              successRate >= 95
                ? 'bg-green-500'
                : successRate >= 90
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(campaign.status)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/dashboard/campaigns/${campaign.id}`}
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          詳細
        </Link>
      </td>
    </tr>
  );
}

function HistoryListSkeleton() {
  return (
    <div className="space-y-6">
      {/* 統計サマリーのスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フィルター・検索エリアのスケルトン */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>

      {/* テーブルのスケルトン */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-500 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
