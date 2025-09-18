"use client"
import { Calendar, Download, Filter, BarChart3 } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">配信履歴</h1>
          <p className="text-muted-foreground">
            過去の配信・結果を一覧表示
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
          <button className="px-3 py-2 rounded-lg border bg-white/50 hover:bg-white/70 transition inline-flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">総配信数</div>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">127</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">全期間</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">総リーチ</div>
            <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">1.2M</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">累計</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">平均CTR</div>
            <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">4.8%</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">全期間平均</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="text-sm font-medium">今月配信</div>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">+8 先月比</p>
        </div>
      </div>

      {/* History Table */}
      <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft">
        <h2 className="text-base font-semibold mb-1">配信履歴詳細</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">配信されたメッセージとその結果</p>
        <div className="rounded-lg border border-white/30 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/30">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">配信日時</th>
                  <th className="px-6 py-3 text-left font-medium">メッセージタイトル</th>
                  <th className="px-6 py-3 text-right font-medium">配信数</th>
                  <th className="px-6 py-3 text-right font-medium">開封率</th>
                  <th className="px-6 py-3 text-right font-medium">CTR</th>
                  <th className="px-6 py-3 text-left font-medium">ステータス</th>
                  <th className="px-6 py-3 text-left font-medium">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-slate-700/60">
                <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">2024/07/15 10:00</td>
                  <td className="px-6 py-4">夏のセール開始のお知らせ</td>
                  <td className="px-6 py-4 text-right">12,340</td>
                  <td className="px-6 py-4 text-right">89.2%</td>
                  <td className="px-6 py-4 text-right">6.8%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                      配信完了
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">詳細</button>
                  </td>
                </tr>

                <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">2024/07/12 14:30</td>
                  <td className="px-6 py-4">新スタンプリリース告知</td>
                  <td className="px-6 py-4 text-right">11,890</td>
                  <td className="px-6 py-4 text-right">85.4%</td>
                  <td className="px-6 py-4 text-right">5.2%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                      配信完了
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">詳細</button>
                  </td>
                </tr>

                <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">2024/07/10 16:00</td>
                  <td className="px-6 py-4">ライブ配信のお知らせ</td>
                  <td className="px-6 py-4 text-right">12,100</td>
                  <td className="px-6 py-4 text-right">92.1%</td>
                  <td className="px-6 py-4 text-right">8.3%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                      配信完了
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">詳細</button>
                  </td>
                </tr>

                <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">2024/07/08 11:15</td>
                  <td className="px-6 py-4">限定グッズ販売開始</td>
                  <td className="px-6 py-4 text-right">9,876</td>
                  <td className="px-6 py-4 text-right">87.6%</td>
                  <td className="px-6 py-4 text-right">4.9%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                      配信完了
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">詳細</Button>
                  </td>
                </tr>

                <tr className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">2024/07/05 09:30</td>
                  <td className="px-6 py-4">月初のご挨拶</td>
                  <td className="px-6 py-4 text-right">12,234</td>
                  <td className="px-6 py-4 text-right">91.3%</td>
                  <td className="px-6 py-4 text-right">3.2%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
                      配信完了
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-sm rounded-md hover:bg-white/40">詳細</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  )
}
