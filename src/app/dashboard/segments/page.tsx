import { Suspense } from "react";
import Link from "next/link";
import { getSegments } from "@/ui/actions/segmentActions";

export default function SegmentsPage() {
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
                🎯 配信セグメント
              </h1>
            </div>
            <Link
              href="/dashboard/segments/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + 新規セグメント作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<SegmentListSkeleton />}>
            <SegmentList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function SegmentList() {
  // 実際のアプリケーションでは認証からaccountIdを取得
  const accountId = "demo-account-id";
  const result = await getSegments(accountId);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          エラーが発生しました: {result.error}
        </div>
      </div>
    );
  }

  const segments = result.data;

  if (segments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          まだセグメントが作成されていません
        </div>
        <Link
          href="/dashboard/segments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          最初のセグメントを作成
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    総セグメント数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {segments.length}
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
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    平均対象者数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {segments.length > 0
                      ? Math.round(
                          segments.reduce(
                            (sum, s) => sum + (s.estimatedCount || 0),
                            0,
                          ) / segments.length,
                        ).toLocaleString()
                      : 0}
                    名
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
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    使用回数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {segments.reduce((sum, s) => sum + (s.usageCount || 0), 0)}
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
              <option value="">すべてのタイプ</option>
              <option value="demographic">デモグラフィック</option>
              <option value="behavioral">行動ベース</option>
              <option value="custom">カスタム</option>
            </select>
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべての条件</option>
              <option value="has_age">年齢指定あり</option>
              <option value="has_gender">性別指定あり</option>
              <option value="has_region">地域指定あり</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="セグメント名で検索..."
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      {/* セグメント一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <SegmentCard key={segment.id} segment={segment} />
        ))}
      </div>
    </div>
  );
}

function SegmentCard({ segment }: { segment: any }) {
  const getCriteriaText = (criteria: any) => {
    const parts = [];

    if (criteria.ageRange) {
      parts.push(`${criteria.ageRange.min}-${criteria.ageRange.max}歳`);
    }

    if (criteria.genders && criteria.genders.length > 0) {
      const genderLabels = criteria.genders.map((g: string) => {
        switch (g) {
          case "male":
            return "男性";
          case "female":
            return "女性";
          default:
            return g;
        }
      });
      parts.push(genderLabels.join("・"));
    }

    if (criteria.regions && criteria.regions.length > 0) {
      const regionLabels = criteria.regions.map((r: string) => {
        // 地域コードから日本語名への変換（簡略版）
        switch (r) {
          case "JP-13":
            return "東京都";
          case "JP-27":
            return "大阪府";
          case "JP-14":
            return "神奈川県";
          default:
            return r;
        }
      });
      parts.push(regionLabels.join("・"));
    }

    return parts.length > 0 ? parts.join(" / ") : "条件なし";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "demographic":
        return "👥";
      case "behavioral":
        return "📊";
      case "custom":
        return "🎯";
      default:
        return "📋";
    }
  };

  return (
    <Link href={`/dashboard/segments/${segment.id}`}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{getTypeIcon(segment.type)}</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {segment.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {segment.description}
              </p>
            </div>
          </div>

          {/* セグメント条件 */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              対象条件:
            </div>
            <div className="text-sm text-gray-900 dark:text-white">
              {getCriteriaText(segment.criteria)}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {segment.estimatedCount?.toLocaleString() || 0}名
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                使用: {segment.usageCount || 0}回
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {new Date(segment.updatedAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SegmentListSkeleton() {
  return (
    <div className="space-y-6">
      {/* 統計情報のスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
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
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>

      {/* セグメント一覧のスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-3"></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
