'use client'
import { useCreateCampaignForm } from './useCreateCampaignForm'
import { makeClient } from '@vt/api-client/src/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const client = makeClient()

export default function NewCampaignPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useCreateCampaignForm()

  const onSubmit = async (values: any) => {
    try {
      const res = await client.POST('/api/v1/campaigns', { body: values })
      if (res.error) {
        throw new Error('キャンペーンの作成に失敗しました')
      }
      router.push('/campaigns')
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('エラーが発生しました')
    }
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/campaigns"
            className="text-blue-600 hover:text-blue-800"
          >
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold">新規キャンペーン作成</h1>
        </div>

        <form
          className="space-y-4 bg-white p-6 rounded-lg border"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タイトル *
            </label>
            <input
              id="title"
              type="text"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              本文 *
            </label>
            <textarea
              id="body"
              rows={6}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('body')}
            />
            {errors.body && (
              <p className="text-sm text-red-600 mt-1">{errors.body.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              画像URL
            </label>
            <input
              id="imageUrl"
              type="url"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
              配信予定日時
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('scheduledAt')}
            />
            {errors.scheduledAt && (
              <p className="text-sm text-red-600 mt-1">{errors.scheduledAt.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <select
              id="status"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('status')}
            >
              <option value="draft">下書き</option>
              <option value="scheduled">配信予定</option>
              <option value="sent">配信済み</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? '作成中…' : '作成'}
            </button>
            <Link
              href="/campaigns"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}