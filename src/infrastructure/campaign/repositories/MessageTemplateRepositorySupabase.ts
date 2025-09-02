import { MessageTemplate } from '@/domain/campaign/entities/MessageTemplate';
import { MessageTemplate } from '@/domain/campaign/entities/MessageTemplate';
import type { MessageTemplateRepository } from '@/domain/campaign/repositories/MessageTemplateRepository';
import { MessageContent, type MessageType } from '@/domain/valueObjects/MessageContent';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class MessageTemplateRepositorySupabase implements MessageTemplateRepository {
  async save(template: MessageTemplate): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('message_templates').upsert({
      id: template.id,
      account_id: template.accountId,
      title: template.title,
      description: template.description,
      content: template.content.toJSON(),
      placeholder_keys: template.placeholderKeys,
      is_active: template.isActive,
      created_at: template.createdAt.toISOString(),
      updated_at: template.updatedAt.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save message template: ${error.message}`);
    }
  }

  async findById(id: string): Promise<MessageTemplate | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find message template: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByAccountId(accountId: string): Promise<MessageTemplate[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find message templates: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findActiveByAccountId(accountId: string): Promise<MessageTemplate[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find active message templates: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findByNamePattern(accountId: string, namePattern: string): Promise<MessageTemplate[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('account_id', accountId)
      .ilike('title', `%${namePattern}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search message templates: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findByPlaceholderKey(
    accountId: string,
    placeholderKey: string
  ): Promise<MessageTemplate[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('message_templates')
      .select('*')
      .eq('account_id', accountId)
      .contains('placeholder_keys', [placeholderKey])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find message templates by placeholder: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('message_templates').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete message template: ${error.message}`);
    }
  }

  async countByAccountId(accountId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('message_templates')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to count message templates: ${error.message}`);
    }

    return count ?? 0;
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('message_templates')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to count active message templates: ${error.message}`);
    }

    return count ?? 0;
  }

  private mapToEntity(data: any): MessageTemplate {
    const content = MessageContent.reconstruct(
      data.content.type as MessageType,
      data.content.payload
    );

    return MessageTemplate.reconstruct(
      data.id,
      data.account_id,
      data.title,
      data.description,
      content,
      data.placeholder_keys || [],
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
