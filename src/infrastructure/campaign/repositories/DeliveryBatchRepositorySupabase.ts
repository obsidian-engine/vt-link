import { DeliveryBatch, DeliveryBatchStatus } from '@/domain/campaign/entities/DeliveryBatch';
import { DeliveryBatchRepository } from '@/domain/campaign/repositories/DeliveryBatchRepository';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class DeliveryBatchRepositorySupabase implements DeliveryBatchRepository {
  async save(batch: DeliveryBatch): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('delivery_batches')
      .upsert({
        id: batch.id,
        campaign_id: batch.campaignId,
        line_broadcast_id: batch.lineBroadcastId,
        target_user_ids: batch.targetUserIds,
        status: batch.status,
        sent_count: batch.sentCount,
        fail_count: batch.failCount,
        error_code: batch.errorCode,
        error_message: batch.errorMessage,
        sent_at: batch.sentAt?.toISOString() || null,
        created_at: batch.createdAt.toISOString(),
        updated_at: batch.updatedAt.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save delivery batch: ${error.message}`);
    }
  }

  async findById(id: string): Promise<DeliveryBatch | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find delivery batch: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCampaignId(campaignId: string): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find delivery batches: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByStatus(status: DeliveryBatchStatus): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to find delivery batches by status: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByCampaignIdAndStatus(campaignId: string, status: DeliveryBatchStatus): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find delivery batches by campaign and status: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findPendingBatches(limit = 50): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('status', DeliveryBatchStatus.Pending)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find pending batches: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByLineBroadcastId(lineBroadcastId: string): Promise<DeliveryBatch | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .eq('line_broadcast_id', lineBroadcastId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find delivery batch by LINE broadcast ID: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCreatedDateRange(startDate: Date, endDate: Date): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find batches by created date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findBySentDateRange(startDate: Date, endDate: Date): Promise<DeliveryBatch[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('*')
      .gte('sent_at', startDate.toISOString())
      .lte('sent_at', endDate.toISOString())
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find batches by sent date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('delivery_batches')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete delivery batch: ${error.message}`);
    }
  }

  async getCampaignDeliveryStats(campaignId: string): Promise<{
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    totalTargetUsers: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('status, target_user_ids, sent_count, fail_count')
      .eq('campaign_id', campaignId);

    if (error) {
      throw new Error(`Failed to get campaign delivery stats: ${error.message}`);
    }

    const batches = data ?? [];
    const totalBatches = batches.length;
    const completedBatches = batches.filter(b => b.status === DeliveryBatchStatus.Completed).length;
    const failedBatches = batches.filter(b => b.status === DeliveryBatchStatus.Failed).length;
    const totalTargetUsers = batches.reduce((sum, b) => sum + (b.target_user_ids?.length || 0), 0);
    const totalSentMessages = batches.reduce((sum, b) => sum + (b.sent_count || 0), 0);
    const totalFailedMessages = batches.reduce((sum, b) => sum + (b.fail_count || 0), 0);
    
    const totalProcessed = totalSentMessages + totalFailedMessages;
    const averageSuccessRate = totalProcessed > 0 ? totalSentMessages / totalProcessed : 0;

    return {
      totalBatches,
      completedBatches,
      failedBatches,
      totalTargetUsers,
      totalSentMessages,
      totalFailedMessages,
      averageSuccessRate,
    };
  }

  async getOverallDeliveryStats(startDate: Date, endDate: Date): Promise<{
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    totalTargetUsers: number;
    totalSentMessages: number;
    totalFailedMessages: number;
    averageSuccessRate: number;
    averageLatencyMs: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_batches')
      .select('status, target_user_ids, sent_count, fail_count, created_at, sent_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to get overall delivery stats: ${error.message}`);
    }

    const batches = data ?? [];
    const totalBatches = batches.length;
    const completedBatches = batches.filter(b => b.status === DeliveryBatchStatus.Completed).length;
    const failedBatches = batches.filter(b => b.status === DeliveryBatchStatus.Failed).length;
    const totalTargetUsers = batches.reduce((sum, b) => sum + (b.target_user_ids?.length || 0), 0);
    const totalSentMessages = batches.reduce((sum, b) => sum + (b.sent_count || 0), 0);
    const totalFailedMessages = batches.reduce((sum, b) => sum + (b.fail_count || 0), 0);
    
    const totalProcessed = totalSentMessages + totalFailedMessages;
    const averageSuccessRate = totalProcessed > 0 ? totalSentMessages / totalProcessed : 0;

    // Calculate average latency for completed batches
    const completedWithLatency = batches.filter(b => 
      b.status === DeliveryBatchStatus.Completed && b.created_at && b.sent_at
    );
    
    const totalLatencyMs = completedWithLatency.reduce((sum, b) => {
      const latency = new Date(b.sent_at).getTime() - new Date(b.created_at).getTime();
      return sum + latency;
    }, 0);
    
    const averageLatencyMs = completedWithLatency.length > 0 
      ? totalLatencyMs / completedWithLatency.length 
      : 0;

    return {
      totalBatches,
      completedBatches,
      failedBatches,
      totalTargetUsers,
      totalSentMessages,
      totalFailedMessages,
      averageSuccessRate,
      averageLatencyMs,
    };
  }

  private mapToEntity(data: any): DeliveryBatch {
    return DeliveryBatch.reconstruct(
      data.id,
      data.campaign_id,
      data.line_broadcast_id,
      data.target_user_ids || [],
      data.status as DeliveryBatchStatus,
      data.sent_count || 0,
      data.fail_count || 0,
      data.error_code,
      data.error_message,
      data.sent_at ? new Date(data.sent_at) : null,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}