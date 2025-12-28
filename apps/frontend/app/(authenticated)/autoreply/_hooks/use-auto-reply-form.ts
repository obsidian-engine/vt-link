'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  type: z.enum(['follow', 'keyword']),
  name: z.string().min(1, 'ルール名を入力してください').max(50, 'ルール名は50文字以内で入力してください'),
  keywords: z.array(z.string()).max(10, '反応する言葉は最大10個までです').optional(),
  matchType: z.enum(['exact', 'partial']).optional(),
  replyMessage: z.string().min(1, '返信メッセージを入力してください').max(1000, '返信メッセージは1000文字以内で入力してください'),
  priority: z.number().min(1).max(5),
  isEnabled: z.boolean()
})

export type AutoReplyFormValues = z.infer<typeof formSchema>

export function useAutoReplyForm(defaultValues?: Partial<AutoReplyFormValues>) {
  return useForm<AutoReplyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'keyword',
      name: '',
      keywords: [],
      matchType: 'partial',
      replyMessage: '',
      priority: 1,
      isEnabled: true,
      ...defaultValues
    }
  })
}
