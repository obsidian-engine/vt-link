export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            🎭 VTube LINE Manager
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12">
            VTuber向けLINE公式アカウント管理ツール
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon="🎨"
              title="リッチメニュー"
              description="ドラッグ&ドロップで簡単作成"
            />
            <FeatureCard icon="🤖" title="自動返信Bot" description="キーワード自動応答設定" />
            <FeatureCard icon="📤" title="メッセージ配信" description="予約配信・一斉配信対応" />
          </div>

          <div className="mt-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
