
export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl p-6 transition
                       bg-white/60 dark:bg-slate-800/40
                       backdrop-blur border border-white/40 dark:border-slate-700/60
                       shadow-md hover:shadow-lg">
          <p className="text-[11px] tracking-wide uppercase text-slate-600 dark:text-slate-400 mb-1">友だち数</p>
          <p className="text-3xl font-bold leading-tight">12,340</p>
          <p className="text-xs text-slate-500/90 dark:text-slate-400/90 mt-1">前月比 +3.2%</p>
        </div>
        <div className="rounded-xl p-6 transition
                       bg-white/60 dark:bg-slate-800/40
                       backdrop-blur border border-white/40 dark:border-slate-700/60
                       shadow-md hover:shadow-lg">
          <p className="text-[11px] tracking-wide uppercase text-slate-600 dark:text-slate-400 mb-1">今月の送信</p>
          <p className="text-3xl font-bold leading-tight">8,900</p>
          <p className="text-xs text-slate-500/90 dark:text-slate-400/90 mt-1">/ 15,000 制限</p>
        </div>
        <div className="rounded-xl p-6 transition
                       bg-white/60 dark:bg-slate-800/40
                       backdrop-blur border border-white/40 dark:border-slate-700/60
                       shadow-md hover:shadow-lg">
          <p className="text-[11px] tracking-wide uppercase text-slate-600 dark:text-slate-400 mb-1">平均CTR</p>
          <p className="text-3xl font-bold leading-tight">4.8%</p>
          <p className="text-xs text-slate-500/90 dark:text-slate-400/90 mt-1">前月比 +0.3%</p>
        </div>
        <div className="rounded-xl p-6 transition
                       bg-white/60 dark:bg-slate-800/40
                       backdrop-blur border border-white/40 dark:border-slate-700/60
                       shadow-md hover:shadow-lg">
          <p className="text-[11px] tracking-wide uppercase text-slate-600 dark:text-slate-400 mb-1">今月の売上</p>
          <p className="text-3xl font-bold leading-tight">¥540,000</p>
          <p className="text-xs text-slate-500/90 dark:text-slate-400/90 mt-1">前月比 +12.5%</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="rounded-xl overflow-hidden
                     bg-white/70 dark:bg-slate-800/40
                     backdrop-blur border border-white/40 dark:border-slate-700/60
                     shadow-md">
        <div className="p-6 border-b border-white/50 dark:border-slate-700/60
                        flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">最近のキャンペーン</span>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors">
              更新
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-700/80 dark:text-slate-300
                             bg-white/60 dark:bg-slate-800/50">
              <tr className="border-b border-white/50 dark:border-slate-700/60">
                <th className="px-6 py-3 text-left font-semibold">キャンペーン名</th>
                <th className="px-6 py-3 text-right font-semibold">送信</th>
                <th className="px-6 py-3 text-right font-semibold">CTR</th>
                <th className="px-6 py-3 text-right font-semibold">CVR</th>
                <th className="px-6 py-3 text-left font-semibold">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-slate-700/60">
              <tr className="transition-colors
                             hover:bg-white/40 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium">夏のセール告知</td>
                <td className="px-6 py-4 text-right">5,000</td>
                <td className="px-6 py-4 text-right">6.2%</td>
                <td className="px-6 py-4 text-right">1.1%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                    配信中
                  </span>
                </td>
              </tr>
              <tr className="transition-colors
                             hover:bg-white/40 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium">新スタンプ発売</td>
                <td className="px-6 py-4 text-right">7,800</td>
                <td className="px-6 py-4 text-right">5.0%</td>
                <td className="px-6 py-4 text-right">0.9%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-700 dark:text-red-400">
                    終了
                  </span>
                </td>
              </tr>
              <tr className="transition-colors
                             hover:bg-white/40 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium">限定ライブ招待</td>
                <td className="px-6 py-4 text-right">3,200</td>
                <td className="px-6 py-4 text-right">7.4%</td>
                <td className="px-6 py-4 text-right">2.4%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">
                    一時停止
                  </span>
                </td>
              </tr>
              <tr className="transition-colors
                             hover:bg-white/40 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium">秋の感謝祭ティザー</td>
                <td className="px-6 py-4 text-right">2,450</td>
                <td className="px-6 py-4 text-right">6.9%</td>
                <td className="px-6 py-4 text-right">1.5%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400">
                    準備中
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
