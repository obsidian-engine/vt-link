'use client'
import { useState } from 'react'
import { RichMenuArea } from '@/lib/api-client'

interface PreviewProps {
  imageUrl?: string
  areas: RichMenuArea[]
}

export function Preview({ imageUrl, areas }: PreviewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!imageUrl) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">画像をアップロードすると、プレビューが表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">プレビュー</h3>
      <div className="relative w-full max-w-2xl mx-auto">
        {/* 背景画像 */}
        <img src={imageUrl} alt="リッチメニュー" className="w-full rounded-lg" />

        {/* エリアオーバーレイ */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2500 1686" preserveAspectRatio="none">
          {areas.map((area, index) => {
            const isHovered = hoveredIndex === index
            const { x, y, width, height } = area.bounds

            return (
              <g key={index}>
                {/* エリア境界 */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={isHovered ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="4"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* エリア番号 */}
                <text
                  x={x + width / 2}
                  y={y + 40}
                  textAnchor="middle"
                  fill="white"
                  fontSize="32"
                  fontWeight="bold"
                  className="pointer-events-none"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {index + 1}
                </text>
              </g>
            )
          })}
        </svg>

        {/* ホバー時のアクション情報表示 */}
        {hoveredIndex !== null && (
          <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-medium">
                エリア {hoveredIndex + 1}: {areas[hoveredIndex].action.label || '未設定'}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                {areas[hoveredIndex].action.type === 'uri'
                  ? `リンク: ${areas[hoveredIndex].action.uri || 'URLなし'}`
                  : `メッセージ: ${areas[hoveredIndex].action.text || 'テキストなし'}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
