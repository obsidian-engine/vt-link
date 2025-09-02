'use server';

import { CreateRichMenuUsecase } from '@/application/richMenu/CreateRichMenuUsecase';
import { RichMenuRepositorySupabase } from '@/infrastructure/repositories/supabase/RichMenuRepositorySupabase';
import { revalidatePath } from 'next/cache';

export async function createRichMenu(formData: FormData) {
  try {
    const accountId = formData.get('accountId') as string;
    const name = formData.get('name') as string;
    const size = formData.get('size') as 'full' | 'half';
    const chatBarText = formData.get('chatBarText') as string;
    const areasJson = formData.get('areas') as string;

    if (!accountId) {
      throw new Error('Account ID is required');
    }
    
    if (!name) {
      throw new Error('Name is required');
    }

    // エリア情報をパース
    let areas = [];
    if (areasJson) {
      try {
        areas = JSON.parse(areasJson);
      } catch (parseError) {
        throw new Error('Invalid areas data');
      }
    }

    const repository = new RichMenuRepositorySupabase();
    const usecase = new CreateRichMenuUsecase(repository);

    const result = await usecase.execute({
      accountId,
      name,
      size: size ?? 'full',
      chatBarText: chatBarText || undefined,
      areas,
    });

    revalidatePath('/dashboard/rich-menu');
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

export async function getRichMenus(accountId: string) {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const repository = new RichMenuRepositorySupabase();
    const richMenus = await repository.findByAccountId(accountId);

    return {
      success: true,
      data: richMenus.map(menu => ({
        id: menu.id,
        name: menu.name,
        size: menu.size,
        chatBarText: menu.chatBarText,
        imageUrl: menu.imageUrl,
        isDefault: menu.isDefault,
        isPublished: menu.isPublished,
        canBePublished: menu.canBePublished(),
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}