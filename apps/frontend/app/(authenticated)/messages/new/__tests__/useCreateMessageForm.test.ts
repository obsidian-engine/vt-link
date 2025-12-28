import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// スキーマを直接テストするため、コンポーネントからスキーマ定義を抽出
const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください'),
  imageUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  scheduledAt: z.string().datetime('有効な日時を入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  status: z.enum(['draft', 'scheduled']).default('draft')
})

describe('useCreateMessageForm schema validation', () => {
  describe('必須フィールドのバリデーション', () => {
    it('title が空の場合エラーを返す', () => {
      const result = schema.safeParse({
        title: '',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const titleError = result.error.issues.find(issue => issue.path[0] === 'title')
        expect(titleError?.message).toBe('タイトルは必須です')
      }
    })

    it('body が空の場合エラーを返す', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: '',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const bodyError = result.error.issues.find(issue => issue.path[0] === 'body')
        expect(bodyError?.message).toBe('本文は必須です')
      }
    })
  })

  describe('文字数制限のバリデーション', () => {
    it('title が100文字を超える場合エラーを返す', () => {
      const longTitle = 'a'.repeat(101)
      const result = schema.safeParse({
        title: longTitle,
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(false)
    })

    it('title が100文字以内の場合エラーを返さない', () => {
      const validTitle = 'a'.repeat(100)
      const result = schema.safeParse({
        title: validTitle,
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
    })

    it('body が1000文字を超える場合エラーを返す', () => {
      const longBody = 'a'.repeat(1001)
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: longBody,
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(false)
    })

    it('body が1000文字以内の場合エラーを返さない', () => {
      const validBody = 'a'.repeat(1000)
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: validBody,
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
    })
  })

  describe('URL形式のバリデーション', () => {
    it('imageUrl が不正なURL形式の場合エラーを返す', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: 'invalid-url',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const imageUrlError = result.error.issues.find(issue => issue.path[0] === 'imageUrl')
        expect(imageUrlError?.message).toBe('有効なURLを入力してください')
      }
    })

    it('imageUrl が正しいURL形式の場合エラーを返さない', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: 'https://example.com/image.jpg',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
    })

    it('imageUrl が空文字列の場合エラーを返さない（optional）', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        // 空文字列はundefinedに変換されることを確認
        expect(result.data.imageUrl).toBeUndefined()
      }
    })
  })

  describe('日時形式のバリデーション', () => {
    it('scheduledAt が不正な日時形式の場合エラーを返す', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: 'invalid-datetime',
        status: 'draft'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const scheduledAtError = result.error.issues.find(issue => issue.path[0] === 'scheduledAt')
        expect(scheduledAtError?.message).toBe('有効な日時を入力してください')
      }
    })

    it('scheduledAt が正しいISO 8601形式の場合エラーを返さない', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '2025-01-15T10:00:00Z',
        status: 'draft'
      })

      expect(result.success).toBe(true)
    })

    it('scheduledAt が空文字列の場合エラーを返さない（optional）', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        // 空文字列はundefinedに変換されることを確認
        expect(result.data.scheduledAt).toBeUndefined()
      }
    })
  })

  describe('status フィールドのバリデーション', () => {
    it('status が draft の場合エラーを返さない', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
    })

    it('status が scheduled の場合エラーを返さない', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'scheduled'
      })

      expect(result.success).toBe(true)
    })

    it('status が sent の場合エラーを返す（schema-zod準拠）', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'sent' as 'draft' // 型エラーを回避するためにキャスト
      })

      expect(result.success).toBe(false)
    })
  })

  describe('正常系のテスト', () => {
    it('全フィールドが正しい場合、バリデーションが成功する', () => {
      const result = schema.safeParse({
        title: '新商品リリース記念',
        body: '新商品のリリースを記念して、先着100名様に限定グッズをプレゼント！',
        imageUrl: 'https://example.com/image.jpg',
        scheduledAt: '2025-01-15T10:00:00Z',
        status: 'scheduled'
      })

      expect(result.success).toBe(true)
    })

    it('オプションフィールドが空でも、必須フィールドが正しければバリデーションが成功する', () => {
      const result = schema.safeParse({
        title: 'テストタイトル',
        body: 'テスト本文',
        imageUrl: '',
        scheduledAt: '',
        status: 'draft'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        // 空文字列はundefinedに変換されることを確認
        expect(result.data.imageUrl).toBeUndefined()
        expect(result.data.scheduledAt).toBeUndefined()
      }
    })
  })
})
