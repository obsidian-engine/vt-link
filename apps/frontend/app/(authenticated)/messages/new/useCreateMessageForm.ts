'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  body: z.string().min(1, '本文は必須です'),
  imageUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  scheduledAt: z.string().datetime('有効な日時を入力してください').optional().or(z.literal('')).transform(v => v || undefined),
  status: z.enum(['draft', 'scheduled', 'sent']).default('draft')
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