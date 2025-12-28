'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください'),
  imageUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  scheduledAt: z.string().datetime('有効な日時を入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  status: z.enum(['draft', 'scheduled']).default('draft')
})

export type FormValues = z.infer<typeof schema>

export function useCreateMessageForm() {
  return useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      body: '',
      imageUrl: '',
      scheduledAt: '',
      status: 'draft'
    }
  })
}