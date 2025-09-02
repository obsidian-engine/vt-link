import { RichMenu, RichMenuArea } from '@/domain/entities/RichMenu';
import { RichMenuRepository } from '@/domain/repositories/RichMenuRepository';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class RichMenuRepositorySupabase implements RichMenuRepository {
  async save(richMenu: RichMenu): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('rich_menus')
      .upsert({
        id: richMenu.id,
        account_id: richMenu.accountId,
        line_rich_menu_id: richMenu.lineRichMenuId,
        name: richMenu.name,
        size: richMenu.size,
        chat_bar_text: richMenu.chatBarText,
        areas: richMenu.areas as unknown,
        image_url: richMenu.imageUrl,
        is_default: richMenu.isDefault,
        is_published: richMenu.isPublished,
      });

    if (error) {
      throw new Error(`Failed to save rich menu: ${error.message}`);
    }
  }

  async findById(id: string): Promise<RichMenu | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('rich_menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find rich menu: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByAccountId(accountId: string): Promise<RichMenu[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('rich_menus')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find rich menus: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findDefaultByAccountId(accountId: string): Promise<RichMenu | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('rich_menus')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find default rich menu: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('rich_menus')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete rich menu: ${error.message}`);
    }
  }

  async setAsDefault(id: string, accountId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error: resetError } = await supabaseAdmin
      .from('rich_menus')
      .update({ is_default: false })
      .eq('account_id', accountId)
      .eq('is_default', true);

    if (resetError) {
      throw new Error(`Failed to reset default rich menu: ${resetError.message}`);
    }

    const { error: setError } = await supabaseAdmin
      .from('rich_menus')
      .update({ is_default: true })
      .eq('id', id);

    if (setError) {
      throw new Error(`Failed to set default rich menu: ${setError.message}`);
    }
  }

  private mapToEntity(data: any): RichMenu {
    return RichMenu.reconstruct(
      data.id,
      data.account_id,
      data.line_rich_menu_id,
      data.name,
      data.size,
      data.chat_bar_text,
      (data.areas as RichMenuArea[]) ?? [],
      data.image_url,
      data.is_default,
      data.is_published
    );
  }
}