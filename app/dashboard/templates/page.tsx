import type { MessageTemplate, TemplateContent } from '@/types/dashboard.types';
import { getTemplates } from '@/ui/actions/templateActions';
import Link from 'next/link';
import { Suspense } from 'react';

export default function TemplatesPage() {
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
                📝 メッセージテンプレート
              </h1>
            </div>
            <Link
              href="/dashboard/templates/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + 新規テンプレート作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<TemplateListSkeleton />}>
            <TemplateList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function TemplateList() {
  // 実際のアプリケーションでは認証からaccountIdを取得
  const accountId = 'demo-account-id';
  const result = await getTemplates(accountId);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">エラーが発生しました: {result.error}</div>
      </div>
    );
  }

  const templates = result.data;

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          まだテンプレートが作成されていません
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          最初のテンプレートを作成
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
              <option value="">すべてのカテゴリ</option>
              <option value="notification">お知らせ</option>
              <option value="promotion">プロモーション</option>
              <option value="greeting">挨拶</option>
              <option value="other">その他</option>
            </select>
            <select className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm">
              <option value="">すべてのタイプ</option>
              <option value="text">テキスト</option>
              <option value="image">画像</option>
              <option value="sticker">スタンプ</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="テンプレート名で検索..."
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      {/* テンプレート一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: any }) {
  const getTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'text':
        return '💬';
      case 'image':
        return '🖼️';
      case 'sticker':
        return '😊';
      default:
        return '📄';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'notification':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            お知らせ
          </span>
        );
      case 'promotion':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            プロモーション
          </span>
        );
      case 'greeting':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            挨拶
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            その他
          </span>
        );
    }
  };

  const getPreviewText = (content: any) => {
    if (!content || content.length === 0) return 'コンテンツがありません';

    const firstContent = content[0];
    if (firstContent.type === 'text') {
      return (
        firstContent.payload?.text?.slice(0, 100) +
        (firstContent.payload?.text?.length > 100 ? '...' : '')
      );
    }
    if (firstContent.type === 'image') {
      return '🖼️ 画像メッセージ';
    }
    if (firstContent.type === 'sticker') {
      return '😊 スタンプメッセージ';
    }
    return 'メッセージコンテンツ';
  };

  return (
    <Link href={`/dashboard/templates/${template.id}`}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{getTypeIcon(template.contentType)}</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {template.name}
                </h3>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                {getCategoryBadge(template.category)}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  使用回数: {template.usageCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {template.description || getPreviewText(template.content)}
            </p>
          </div>

          {/* プレースホルダー表示 */}
          {template.placeholders && template.placeholders.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {template.placeholders.slice(0, 3).map((placeholder: string) => (
                  <span
                    key={placeholder}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    {placeholder}
                  </span>
                ))}
                {template.placeholders.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{template.placeholders.length - 3}個
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            最終更新: {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>
    </Link>
  );
}

function TemplateListSkeleton() {
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

      {/* テンプレート一覧のスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
