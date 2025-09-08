export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          VT-Link Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          VTuber LINE Official Account Manager
        </p>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">機能</h2>
            <ul className="text-left space-y-1">
              <li>• VTuberプロフィール管理</li>
              <li>• LINE公式アカウント連携</li>
              <li>• メッセージ配信機能</li>
              <li>• ファン管理システム</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}