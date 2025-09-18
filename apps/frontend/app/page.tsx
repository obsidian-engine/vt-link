import Link from 'next/link'

"use client"

import { useState } from 'react'

type CampaignStatus = '配信中' | '終了' | '一時停止' | '準備中'

interface Campaign {
  name: string
  send: number
  ctr: number
  cvr: number
  status: CampaignStatus
}

const initialCampaigns: Campaign[] = [
  { name: '夏のセール告知', send: 5000, ctr: 6.2, cvr: 1.1, status: '配信中' },
  { name: '新スタンプ発売', send: 7800, ctr: 5.0, cvr: 0.9, status: '終了' },
  { name: '限定ライブ招待', send: 3200, ctr: 7.4, cvr: 2.4, status: '一時停止' },
]

function statusBadgeClasses(status: CampaignStatus): string {
  switch (status) {
    case '配信中':
      return 'bg-green-500/15 text-green-700 dark:text-green-400'
    case '終了':
      return 'bg-red-500/15 text-red-700 dark:text-red-400'
    case '一時停止':
      return 'bg-yellow-400/15 text-yellow-700 dark:text-yellow-300'
    case '準備中':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
  }
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)

  const handleRefresh = (): void => {
    const newItem: Campaign = {
      name: '秋の感謝祭ティザー',
      send: 2450,
      ctr: 6.9,
      cvr: 1.5,
      status: '準備中',
    }
    setCampaigns((prev) => [newItem, ...prev])
  }

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-muted-foreground mb-1">友だち数</p>
          <p className="text-2xl font-bold">12,340</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-muted-foreground mb-1">今月の送信</p>
          <p className="text-2xl font-bold">8,900 / 15,000</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-muted-foreground mb-1">平均CTR</p>
          <p className="text-2xl font-bold">4.8%</p>
        </div>
        <div className="glass dark:glass-dark rounded-lg p-6 shadow-soft hover:shadow-lg transition">
          <p className="text-xs text-muted-foreground mb-1">今月の売上</p>
          <p className="text-2xl font-bold">¥540,000</p>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass dark:glass-dark rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/30 dark:border-slate-700/60 font-medium flex items-center justify-between">
          <span>最近のキャンペーン</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-xs px-3 py-1.5 rounded-md hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            >
              更新
            </button>
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
              {campaigns.map((c) => (
                <tr key={`${c.name}-${c.send}`} className="hover:bg-white/30 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4 text-right">{c.send.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{c.ctr}%</td>
                  <td className="px-6 py-4 text-right">{c.cvr}%</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
