import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          VT-Link Manager ダッシュボード
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              キャンペーン管理
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              LINE配信キャンペーンの作成・管理
            </p>
            <Link
              href="/campaigns"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              キャンペーン管理
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ファン管理
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              ファンリストの管理・分析
            </p>
            <Link
              href="/fans"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              ファン一覧
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              分析レポート
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              エンゲージメント分析・レポート
            </p>
            <Link
              href="/reports"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
            >
              レポート表示
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}