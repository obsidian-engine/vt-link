import { Suspense } from "react";
import Link from "next/link";
import { getRichMenus } from "@/ui/actions/richMenuActions";

export default async function RichMenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                ← ダッシュボード
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🎨 リッチメニュー管理
              </h1>
            </div>
            <Link
              href="/dashboard/rich-menu/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ➕ 新規作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense fallback={<RichMenuListSkeleton />}>
            <RichMenuList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function RichMenuList() {
  // TODO: アカウントIDの取得ロジックを後で実装
  const accountId = "temp-account-id";

  const result = await getRichMenus(accountId);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          エラー: {result.error}
        </div>
      </div>
    );
  }

  const richMenus = result.data;

  if (!richMenus || richMenus.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          リッチメニューがありません
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          最初のリッチメニューを作成してください。
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/rich-menu/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ➕ 新規作成
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {richMenus?.map((menu) => (
        <RichMenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  );
}

interface RichMenuCardProps {
  menu: {
    id: string;
    name: string;
    size: "full" | "half";
    chatBarText: string | null;
    imageUrl: string | null;
    isDefault: boolean;
    isPublished: boolean;
    canBePublished: boolean;
  };
}

function RichMenuCard({ menu }: RichMenuCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {menu.name}
          </h3>
          <div className="flex space-x-2">
            {menu.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                デフォルト
              </span>
            )}
            {menu.isPublished && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                公開中
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            サイズ: {menu.size === "full" ? "フル" : "ハーフ"}
          </div>
          {menu.chatBarText && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              チャットバー: {menu.chatBarText}
            </div>
          )}
        </div>

        {menu.imageUrl && (
          <div className="mt-4">
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Link
            href={`/dashboard/rich-menu/${menu.id}/edit`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            編集
          </Link>

          <div className="flex space-x-4">
            {!menu.isDefault && menu.canBePublished && (
              <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium">
                デフォルトに設定
              </button>
            )}
            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RichMenuListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="mt-4 h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
