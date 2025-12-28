'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRichMenu, createRichMenu, updateRichMenu, deleteRichMenu, publishRichMenu } from '@/lib/hooks/use-rich-menu'
import { ImageUploader } from '@/components/richmenu/image-uploader'
import { TemplateSelector } from '@/components/richmenu/template-selector'
import { AreaEditor } from '@/components/richmenu/area-editor'
import { Preview } from '@/components/richmenu/preview'
import type { RichMenuArea, CreateRichMenuRequest } from '@/lib/api-client'

type Step = 'upload' | 'template' | 'edit' | 'preview'

export default function RichMenuPage() {
  const { richMenu, isLoading, mutate } = useRichMenu()
  const [isCreating, setIsCreating] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [isSaving, setIsSaving] = useState(false)

  // フォーム状態
  const [formData, setFormData] = useState<{
    name: string
    template?: '2x3' | '1x3' | '2x2'
    imageUrl?: string
    areas: RichMenuArea[]
  }>({
    name: '',
    areas: []
  })

  const handleStartCreating = () => {
    setIsCreating(true)
    setCurrentStep('upload')
    setFormData({ name: '', areas: [] })
  }

  const handleCancelCreating = () => {
    setIsCreating(false)
    setCurrentStep('upload')
    setFormData({ name: '', areas: [] })
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }))
    setCurrentStep('template')
  }

  const handleTemplateSelect = (template: '2x3' | '1x3' | '2x2', areas: RichMenuArea[]) => {
    setFormData((prev) => ({ ...prev, template, areas }))
    setCurrentStep('edit')
  }

  const handleAreasUpdate = (areas: RichMenuArea[]) => {
    setFormData((prev) => ({ ...prev, areas }))
  }

  const handlePreview = () => {
    setCurrentStep('preview')
  }

  const handleSave = async () => {
    if (!formData.template || !formData.imageUrl) return

    try {
      setIsSaving(true)

      const request: CreateRichMenuRequest = {
        name: formData.name || '新しいリッチメニュー',
        template: formData.template,
        imageUrl: formData.imageUrl,
        areas: formData.areas
      }

      await createRichMenu(request)
      await mutate()

      setIsCreating(false)
      setFormData({ name: '', areas: [] })
      setCurrentStep('upload')
      toast.success('リッチメニューを保存しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!richMenu) return

    try {
      await publishRichMenu(richMenu.id)
      await mutate()
      toast.success('リッチメニューをLINEに反映しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '反映に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!richMenu) return
    if (!confirm('リッチメニューを削除してもよろしいですか？')) return

    try {
      await deleteRichMenu(richMenu.id)
      await mutate()
      toast.success('リッチメニューを削除しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">リッチメニュー管理</h1>
        {!isCreating && (
          <button
            onClick={handleStartCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新規作成
          </button>
        )}
      </div>

      {/* 作成フロー */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-between mb-6">
            {(['upload', 'template', 'edit', 'preview'] as Step[]).map((step, index) => {
              const stepLabels = {
                upload: '画像',
                template: 'レイアウト',
                edit: 'アクション設定',
                preview: 'プレビュー'
              }
              const isActive = currentStep === step
              const isCompleted =
                (['upload', 'template', 'edit', 'preview'] as Step[]).indexOf(currentStep) > index

              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium">{stepLabels[step]}</span>
                  {index < 3 && <div className="w-12 h-0.5 bg-gray-300 ml-4" />}
                </div>
              )
            })}
          </div>

          {/* メニュー名入力 */}
          <div>
            <label htmlFor="menu-name" className="block text-sm font-medium text-gray-700 mb-1">
              メニュー名
            </label>
            <input
              id="menu-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例: メインメニュー"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ステップ別コンテンツ */}
          {currentStep === 'upload' && <ImageUploader onUploadComplete={handleImageUpload} currentImageUrl={formData.imageUrl} />}

          {currentStep === 'template' && (
            <TemplateSelector selectedTemplate={formData.template} onSelectTemplate={handleTemplateSelect} />
          )}

          {currentStep === 'edit' && <AreaEditor areas={formData.areas} onUpdateAreas={handleAreasUpdate} />}

          {currentStep === 'preview' && <Preview imageUrl={formData.imageUrl} areas={formData.areas} />}

          {/* アクションボタン */}
          <div className="flex gap-3">
            {currentStep === 'edit' && (
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                プレビュー
              </button>
            )}

            {currentStep === 'preview' && (
              <>
                <button
                  onClick={() => setCurrentStep('edit')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存してLINEに反映'}
                </button>
              </>
            )}

            <button
              onClick={handleCancelCreating}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 既存のリッチメニュー表示 */}
      {!isCreating && richMenu && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">{richMenu.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                LINEに反映
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>

          <Preview imageUrl={richMenu.imageUrl} areas={richMenu.areas} />

          <div className="mt-4 text-sm text-gray-500">
            <p>テンプレート: {richMenu.template}</p>
            <p>ステータス: {richMenu.isActive ? '公開中' : '下書き'}</p>
            <p>作成日: {new Date(richMenu.createdAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      )}

      {!isCreating && !richMenu && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">リッチメニューが登録されていません</p>
          <button
            onClick={handleStartCreating}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新規作成
          </button>
        </div>
      )}
    </div>
  )
}