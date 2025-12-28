'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください'),
  imageUrl: z.union([z.string().url('有効なURLを入力してください'), z.literal('')]).transform(v => v || undefined).optional(),
  scheduledAt: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, '有効な日時を入力してください'),
    z.literal('')
  ]).transform(v => v || undefined).optional(),
  status: z.enum(['draft', 'scheduled'])
})

export type FormValues = z.input<typeof formSchema>

export function useCreateMessageForm() {
  return useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      body: '',
      imageUrl: '',
      scheduledAt: '',
      status: 'draft'
    }
  })
}