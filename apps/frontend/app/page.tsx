
export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">友だち数</p>
          <p className="text-2xl font-bold">12,340</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">今月の送信</p>
          <p className="text-2xl font-bold">8,900 / 15,000</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">平均CTR</p>
          <p className="text-2xl font-bold">4.8%</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">今月の売上</p>
          <p className="text-2xl font-bold">¥540,000</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass dark:glass-dark rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/30 dark:border-slate-700/60 font-medium flex items-center justify-between">
          <span>最近のキャンペーン</span>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">更新</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/30">
              <tr>
                <th className="px-6 py-3 text-left font-medium">キャンペーン名</th>
                <th className="px-6 py-3 text-right font-medium">送信</th>
                <th className="px-6 py-3 text-right font-medium">CTR</th>
                <th className="px-6 py-3 text-right font-medium">CVR</th>
                <th className="px-6 py-3 text-left font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-slate-700/60">
              <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition">
                <td className="px-6 py-4">夏のセール告知</td>
                <td className="px-6 py-4 text-right">5,000</td>
                <td className="px-6 py-4 text-right">6.2%</td>
                <td className="px-6 py-4 text-right">1.1%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">配信中</span>
                </td>
              </tr>
              <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition">
                <td className="px-6 py-4">新スタンプ発売</td>
                <td className="px-6 py-4 text-right">7,800</td>
                <td className="px-6 py-4 text-right">5.0%</td>
                <td className="px-6 py-4 text-right">0.9%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400">終了</span>
                </td>
              </tr>
              <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition">
                <td className="px-6 py-4">限定ライブ招待</td>
                <td className="px-6 py-4 text-right">3,200</td>
                <td className="px-6 py-4 text-right">7.4%</td>
                <td className="px-6 py-4 text-right">2.4%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">一時停止</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
