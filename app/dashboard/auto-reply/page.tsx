import { Suspense } from "react";
import Link from "next/link";
import { getAutoReplyRules } from "@/ui/actions/autoReplyActions";

export default async function AutoReplyPage() {
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
                🤖 自動返信Bot
              </h1>
            </div>
            <Link
              href="/dashboard/auto-reply/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              新しいルールを作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              自動返信ルール一覧
            </h2>
            <Suspense fallback={<AutoReplyRulesSkeleton />}>
              <AutoReplyRulesList />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <StatsCard
              title="有効なルール"
              value="0"
              description="現在動作中のルール数"
              icon="✅"
            />
            <StatsCard
              title="今日の自動返信"
              value="0"
              description="本日の自動返信回数"
              icon="📤"
            />
            <StatsCard
              title="平均応答時間"
              value="-"
              description="自動返信の平均処理時間"
              icon="⚡"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

async function AutoReplyRulesList() {
  // TODO: Get account ID from session/context
  const accountId = "default-account";

  try {
    const result = await getAutoReplyRules(accountId);

    if (!result.success) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            ルールの読み込みに失敗しました: {result.error}
          </p>
        </div>
      );
    }

    const rules = result.data || [];

    if (rules.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {rules.map((rule) => (
            <AutoReplyRuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">エラーが発生しました</p>
      </div>
    );
  }
}

function AutoReplyRuleCard({ rule }: { rule: any }) {
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {rule.name}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                rule.enabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {rule.enabled ? "有効" : "無効"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              優先度: {rule.priority}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            条件: {rule.conditionsCount}個 | 返信: {rule.responsesCount}個
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/auto-reply/${rule.id}/edit`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            編集
          </Link>
          <Link
            href={`/dashboard/auto-reply/${rule.id}`}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            詳細
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🤖</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        自動返信ルールがありません
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        新しいルールを作成して自動返信を設定しましょう
      </p>
      <Link
        href="/dashboard/auto-reply/new"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
      >
        最初のルールを作成
      </Link>
    </div>
  );
}

function AutoReplyRulesSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
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
                {value}
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
  );
}
