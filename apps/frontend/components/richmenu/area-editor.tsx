'use client'
import { RichMenuArea } from '@/lib/api-client'

interface AreaEditorProps {
  areas: RichMenuArea[]
  onUpdateAreas: (areas: RichMenuArea[]) => void
}

export function AreaEditor({ areas, onUpdateAreas }: AreaEditorProps) {
  const handleUpdateArea = (index: number, updates: Partial<RichMenuArea['action']>) => {
    const newAreas = [...areas]
    newAreas[index] = {
      ...newAreas[index],
      action: {
        ...newAreas[index].action,
        ...updates
      }
    }
    onUpdateAreas(newAreas)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">エリアアクション設定</h3>
      <div className="space-y-4">
        {areas.map((area, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">エリア {index + 1}</h4>

            {/* ラベル */}
            <div>
              <label htmlFor={`label-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                ボタンラベル
              </label>
              <input
                id={`label-${index}`}
                type="text"
                value={area.action.label || ''}
                onChange={(e) => handleUpdateArea(index, { label: e.target.value })}
                placeholder="例: メニュー、お知らせ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* アクションタイプ */}
            <div>
              <label htmlFor={`type-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                アクション種別
              </label>
              <select
                id={`type-${index}`}
                value={area.action.type}
                onChange={(e) =>
                  handleUpdateArea(index, { type: e.target.value as 'uri' | 'message' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="uri">リンク（URL）</option>
                <option value="message">メッセージ送信</option>
              </select>
            </div>

            {/* URLまたはメッセージ */}
            {area.action.type === 'uri' ? (
              <div>
                <label htmlFor={`uri-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  リンク先URL
                </label>
                <input
                  id={`uri-${index}`}
                  type="url"
                  value={area.action.uri || ''}
                  onChange={(e) => handleUpdateArea(index, { uri: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label htmlFor={`text-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  送信メッセージ
                </label>
                <input
                  id={`text-${index}`}
                  type="text"
                  value={area.action.text || ''}
                  onChange={(e) => handleUpdateArea(index, { text: e.target.value })}
                  placeholder="例: メニューを見る"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* プレビュー */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>プレビュー:</strong>{' '}
              {area.action.type === 'uri'
                ? `「${area.action.label || '未設定'}」→ ${area.action.uri || 'URLなし'}`
                : `「${area.action.label || '未設定'}」→ メッセージ: ${area.action.text || 'テキストなし'}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
