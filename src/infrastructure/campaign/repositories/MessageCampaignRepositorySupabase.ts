import { MessageCampaign, CampaignStatus, CampaignType } from '@/domain/campaign/entities/MessageCampaign';
import { MessageCampaignRepository } from '@/domain/campaign/repositories/MessageCampaignRepository';
import { MessageContent, MessageType } from '@/domain/valueObjects/MessageContent';
import { PlaceholderData } from '@/domain/valueObjects/PlaceholderData';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class MessageCampaignRepositorySupabase implements MessageCampaignRepository {
  async save(campaign: MessageCampaign): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('campaigns')
      .upsert({
        id: campaign.id,
        account_id: campaign.accountId,
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        template_id: campaign.templateId,
        segment_id: campaign.segmentId,
        content: campaign.content.toJSON(),
        placeholder_data: campaign.placeholderData.toJSON(),
        scheduled_at: campaign.scheduledAt?.toISOString() || null,
        status: campaign.status,
        settings: campaign.settings,
        sent_count: campaign.sentCount,
        fail_count: campaign.failCount,
        sent_at: campaign.sentAt?.toISOString() || null,
        failure_reason: campaign.failureReason,
        created_at: campaign.createdAt.toISOString(),
        updated_at: campaign.updatedAt.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save campaign: ${error.message}`);
    }
  }

  async findById(id: string): Promise<MessageCampaign | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find campaign: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByAccountId(accountId: string): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByAccountIdAndStatus(accountId: string, status: CampaignStatus): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by status: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByAccountIdAndType(accountId: string, type: CampaignType): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by type: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findScheduledReadyToSend(currentTime = new Date()): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('status', CampaignStatus.Scheduled)
      .lte('scheduled_at', currentTime.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to find scheduled campaigns: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByTemplateId(templateId: string): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by template: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findBySegmentId(segmentId: string): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('segment_id', segmentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by segment: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByNamePattern(accountId: string, namePattern: string): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .ilike('name', `%${namePattern}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search campaigns: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByCreatedDateRange(accountId: string, startDate: Date, endDate: Date): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by created date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findBySentDateRange(accountId: string, startDate: Date, endDate: Date): Promise<MessageCampaign[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('account_id', accountId)
      .gte('sent_at', startDate.toISOString())
      .lte('sent_at', endDate.toISOString())
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find campaigns by sent date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  async countByAccountId(accountId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to count campaigns: ${error.message}`);
    }

    return count ?? 0;
  }

  async countByAccountIdAndStatus(accountId: string, status: CampaignStatus): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('status', status);

    if (error) {
      throw new Error(`Failed to count campaigns by status: ${error.message}`);
    }

    return count ?? 0;
  }

  async getAccountStatistics(accountId: string): Promise<{
    totalCampaigns: number;
    sentCampaigns: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('status, sent_count, fail_count')
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to get account statistics: ${error.message}`);
    }

    const campaigns = data ?? [];
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === CampaignStatus.Sent).length;
    const totalSentMessages = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalFailedMessages = campaigns.reduce((sum, c) => sum + (c.fail_count || 0), 0);
    
    const totalMessages = totalSentMessages + totalFailedMessages;
    const averageSuccessRate = totalMessages > 0 ? totalSentMessages / totalMessages : 0;

    return {
      totalCampaigns,
      sentCampaigns,
      totalSentMessages,
      totalFailedMessages,
      averageSuccessRate,
    };
  }

  private mapToEntity(data: any): MessageCampaign {
    const content = MessageContent.reconstruct(
      data.content.type as MessageType,
      data.content.payload
    );

    const placeholderData = PlaceholderData.reconstruct(data.placeholder_data || {});

    return MessageCampaign.reconstruct(
      data.id,
      data.account_id,
      data.name,
      data.description,
      data.type as CampaignType,
      data.template_id,
      data.segment_id,
      content,
      placeholderData,
      data.scheduled_at ? new Date(data.scheduled_at) : null,
      data.status as CampaignStatus,
      data.settings,
      data.sent_count,
      data.fail_count,
      data.sent_at ? new Date(data.sent_at) : null,
      data.failure_reason,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}