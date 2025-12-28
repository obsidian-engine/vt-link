'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { RichMenu, CreateRichMenuRequest, RichMenuArea } from '@/lib/api-client'
import { makeClient } from '@/lib/api-client'
import { TemplateSelector } from './template-selector'
import { ImageUploader } from './image-uploader'
import { AreaEditor } from './area-editor'
import { Preview } from './preview'

interface RichMenuClientProps {
  initialRichMenus: RichMenu[]
}

type TemplateType = '2x3' | '1x3' | '2x2'

export function RichMenuClient({ initialRichMenus }: RichMenuClientProps) {
  const router = useRouter()
  const api = makeClient()

  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // フォーム状態
  const [name, setName] = useState('')
  const [template, setTemplate] = useState<TemplateType | undefined>()
  const [imageUrl, setImageUrl] = useState('')
  const [areas, setAreas] = useState<RichMenuArea[]>([])

  const handleStartCreate = () => {
    setIsCreating(true)
    setName('')
    setTemplate(undefined)
    setImageUrl('')
    setAreas([])
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setName('')
    setTemplate(undefined)
    setImageUrl('')
    setAreas([])
  }

  const handleTemplateSelect = (selectedTemplate: TemplateType, templateAreas: RichMenuArea[]) => {
    setTemplate(selectedTemplate)
    setAreas(templateAreas)
  }

  const handleSave = async () => {
    if (!name || !template || !imageUrl || areas.length === 0) {
      alert('すべての項目を入力してください')
      return
    }

    setIsSaving(true)

    try {
      const request: CreateRichMenuRequest = {
        name,
        template,
        imageUrl,
        areas
      }

      const { error } = await api.POST('/richmenu', { body: request })

      if (error) {
        alert(`エラー: ${error.message}`)
        return
      }

      // 成功時
      setIsCreating(false)
      setName('')
      setTemplate(undefined)
      setImageUrl('')
      setAreas([])

      // ページをリフレッシュしてServer Componentから最新データを取得
      router.refresh()
    } catch (err) {
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) {
      return
    }

    const { error } = await api.DELETE('/richmenu', {
      params: { path: { id } }
    })

    if (error) {
      alert(`エラー: ${error.message}`)
      return
    }

    router.refresh()
  }

  const handleActivate = async (id: string) => {
    // リッチメニューを有効化するAPIを呼び出す
    // TODO: バックエンドAPIが実装されたら追加
    alert('リッチメニューの有効化機能は準備中です')
  }

  if (isCreating) {
    return (
      <div className="space-y-6">
        {/* 名前入力 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            リッチメニュー名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: メインメニュー"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* テンプレート選択 */}
        <TemplateSelector
          selectedTemplate={template}
          onSelectTemplate={handleTemplateSelect}
        />

        {/* 画像アップロード */}
        {template && (
          <div>
            <h3 className="text-lg font-medium mb-2">背景画像をアップロード</h3>
            <ImageUploader
              currentImageUrl={imageUrl}
              onUploadComplete={(url) => setImageUrl(url)}
            />
          </div>
        )}

        {/* エリア編集 */}
        {imageUrl && areas.length > 0 && (
          <>
            <AreaEditor areas={areas} onUpdateAreas={setAreas} />
            <Preview imageUrl={imageUrl} areas={areas} />
          </>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={isSaving || !name || !template || !imageUrl || areas.length === 0}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleCancelCreate}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 新規作成ボタン */}
      <div>
        <button
          onClick={handleStartCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          新規作成
        </button>
      </div>

      {/* リッチメニュー一覧 */}
      {initialRichMenus.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">
            リッチメニューがまだ作成されていません
          </p>
          <p className="text-sm text-gray-400">
            「新規作成」ボタンから最初のリッチメニューを作成しましょう
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialRichMenus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img src={menu.imageUrl} alt={menu.name} className="w-full h-48 object-cover" />
                {menu.isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    有効
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{menu.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {menu.template} ({menu.areas.length}エリア)
                </p>
                <div className="flex gap-2">
                  {!menu.isActive && (
                    <button
                      onClick={() => handleActivate(menu.id)}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      有効化
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
