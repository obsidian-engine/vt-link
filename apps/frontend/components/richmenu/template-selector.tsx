'use client'
import { RichMenuArea } from '@/lib/api-client'

type TemplateType = '2x3' | '1x3' | '2x2'

interface TemplateSelectorProps {
  selectedTemplate?: TemplateType
  onSelectTemplate: (template: TemplateType, areas: RichMenuArea[]) => void
}

// LINEリッチメニューのサイズ: 2500x1686px または 2500x843px
const TEMPLATES: Record<
  TemplateType,
  {
    name: string
    description: string
    grid: { rows: number; cols: number }
    bounds: Array<{ x: number; y: number; width: number; height: number }>
  }
> = {
  '2x3': {
    name: '2列3行（6エリア）',
    description: '標準的なレイアウト',
    grid: { rows: 3, cols: 2 },
    bounds: [
      { x: 0, y: 0, width: 1250, height: 562 }, // 左上
      { x: 1250, y: 0, width: 1250, height: 562 }, // 右上
      { x: 0, y: 562, width: 1250, height: 562 }, // 左中
      { x: 1250, y: 562, width: 1250, height: 562 }, // 右中
      { x: 0, y: 1124, width: 1250, height: 562 }, // 左下
      { x: 1250, y: 1124, width: 1250, height: 562 } // 右下
    ]
  },
  '1x3': {
    name: '1列3行（3エリア）',
    description: 'シンプルな縦並び',
    grid: { rows: 3, cols: 1 },
    bounds: [
      { x: 0, y: 0, width: 2500, height: 562 }, // 上
      { x: 0, y: 562, width: 2500, height: 562 }, // 中
      { x: 0, y: 1124, width: 2500, height: 562 } // 下
    ]
  },
  '2x2': {
    name: '2列2行（4エリア）',
    description: 'バランスの良いレイアウト',
    grid: { rows: 2, cols: 2 },
    bounds: [
      { x: 0, y: 0, width: 1250, height: 843 }, // 左上
      { x: 1250, y: 0, width: 1250, height: 843 }, // 右上
      { x: 0, y: 843, width: 1250, height: 843 }, // 左下
      { x: 1250, y: 843, width: 1250, height: 843 } // 右下
    ]
  }
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const handleSelect = (template: TemplateType) => {
    const templateConfig = TEMPLATES[template]
    const areas: RichMenuArea[] = templateConfig.bounds.map((bounds, index) => ({
      bounds,
      action: {
        type: 'uri' as const,
        uri: '',
        label: `エリア ${index + 1}`
      }
    }))

    onSelectTemplate(template, areas)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">レイアウトを選択</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(TEMPLATES) as TemplateType[]).map((template) => {
          const config = TEMPLATES[template]
          const isSelected = selectedTemplate === template

          return (
            <button
              key={template}
              onClick={() => handleSelect(template)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="mb-3">
                <h4 className="font-medium text-sm">{config.name}</h4>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>

              {/* グリッドプレビュー */}
              <div
                className="grid gap-1 bg-gray-200 p-2 rounded aspect-[25/17]"
                style={{
                  gridTemplateColumns: `repeat(${config.grid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${config.grid.rows}, 1fr)`
                }}
              >
                {config.bounds.map((_, index) => (
                  <div key={index} className="bg-white rounded flex items-center justify-center text-xs text-gray-400">
                    {index + 1}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
