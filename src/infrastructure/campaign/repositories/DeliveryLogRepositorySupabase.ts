import { DeliveryLog, DeliveryStatus } from '@/domain/campaign/entities/DeliveryLog';
import { DeliveryLogRepository } from '@/domain/campaign/repositories/DeliveryLogRepository';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class DeliveryLogRepositorySupabase implements DeliveryLogRepository {
  async save(log: DeliveryLog): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('delivery_logs')
      .insert({
        id: log.id,
        batch_id: log.batchId,
        campaign_id: log.campaignId,
        line_user_id: log.lineUserId,
        status: log.status,
        error_code: log.errorCode,
        error_message: log.errorMessage,
        delivered_at: log.deliveredAt.toISOString(),
        response_latency_ms: log.responseLatencyMs,
      });

    if (error) {
      throw new Error(`Failed to save delivery log: ${error.message}`);
    }
  }

  async saveBatch(logs: DeliveryLog[]): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    if (logs.length === 0) return;

    const records = logs.map(log => ({
      id: log.id,
      batch_id: log.batchId,
      campaign_id: log.campaignId,
      line_user_id: log.lineUserId,
      status: log.status,
      error_code: log.errorCode,
      error_message: log.errorMessage,
      delivered_at: log.deliveredAt.toISOString(),
      response_latency_ms: log.responseLatencyMs,
    }));

    const { error } = await supabaseAdmin
      .from('delivery_logs')
      .insert(records);

    if (error) {
      throw new Error(`Failed to save delivery logs: ${error.message}`);
    }
  }

  async findById(id: string): Promise<DeliveryLog | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find delivery log: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByBatchId(batchId: string): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('batch_id', batchId)
      .order('delivered_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find delivery logs by batch: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByCampaignId(campaignId: string, limit = 1000): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find delivery logs by campaign: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByLineUserId(lineUserId: string, limit = 100): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('line_user_id', lineUserId)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find delivery logs by user: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByStatus(status: DeliveryStatus, limit = 1000): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('status', status)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find delivery logs by status: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 1000): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .gte('delivered_at', startDate.toISOString())
      .lte('delivered_at', endDate.toISOString())
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find delivery logs by date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByCampaignIdAndDateRange(campaignId: string, startDate: Date, endDate: Date): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .gte('delivered_at', startDate.toISOString())
      .lte('delivered_at', endDate.toISOString())
      .order('delivered_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find delivery logs by campaign and date range: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByErrorCode(errorCode: string, limit = 1000): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .eq('error_code', errorCode)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find delivery logs by error code: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findSlowDeliveries(thresholdMs: number, limit = 1000): Promise<DeliveryLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('*')
      .gt('response_latency_ms', thresholdMs)
      .order('response_latency_ms', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find slow deliveries: ${error.message}`);
    }

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async deleteByDateRange(startDate: Date, endDate: Date): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('delivery_logs')
      .delete({ count: 'exact' })
      .gte('delivered_at', startDate.toISOString())
      .lte('delivered_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to delete delivery logs: ${error.message}`);
    }

    return count ?? 0;
  }

  async getCampaignLogStats(campaignId: string): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
    errorCodes: { [code: string]: number };
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('status, response_latency_ms, error_code')
      .eq('campaign_id', campaignId);

    if (error) {
      throw new Error(`Failed to get campaign log stats: ${error.message}`);
    }

    return this.calculateStats(data ?? []);
  }

  async getBatchLogStats(batchId: string): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('status, response_latency_ms')
      .eq('batch_id', batchId);

    if (error) {
      throw new Error(`Failed to get batch log stats: ${error.message}`);
    }

    const stats = this.calculateStats(data ?? []);
    return {
      totalLogs: stats.totalLogs,
      successCount: stats.successCount,
      failureCount: stats.failureCount,
      successRate: stats.successRate,
      averageLatencyMs: stats.averageLatencyMs,
    };
  }

  async getDateRangeLogStats(startDate: Date, endDate: Date): Promise<{
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
    dailyStats: Array<{
      date: string;
      totalLogs: number;
      successCount: number;
      failureCount: number;
    }>;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    // Get overall stats
    const { data, error } = await supabaseAdmin
      .from('delivery_logs')
      .select('status, response_latency_ms, delivered_at')
      .gte('delivered_at', startDate.toISOString())
      .lte('delivered_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to get date range log stats: ${error.message}`);
    }

    const logs = data ?? [];
    const stats = this.calculateStats(logs);

    // Calculate daily stats
    const dailyMap = new Map<string, { total: number; success: number; failure: number }>();
    
    logs.forEach(log => {
      const date = log.delivered_at.split('T')[0]; // YYYY-MM-DD
      const existing = dailyMap.get(date) || { total: 0, success: 0, failure: 0 };
      
      existing.total++;
      if (log.status === DeliveryStatus.Success) {
        existing.success++;
      } else {
        existing.failure++;
      }
      
      dailyMap.set(date, existing);
    });

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        totalLogs: stats.total,
        successCount: stats.success,
        failureCount: stats.failure,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      ...stats,
      dailyStats,
    };
  }

  async getTopErrorCodes(limit = 10, dateRange?: { startDate: Date; endDate: Date }): Promise<Array<{
    errorCode: string;
    count: number;
    percentage: number;
  }>> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    let query = supabaseAdmin
      .from('delivery_logs')
      .select('error_code')
      .eq('status', DeliveryStatus.Failed)
      .not('error_code', 'is', null);

    if (dateRange) {
      query = query
        .gte('delivered_at', dateRange.startDate.toISOString())
        .lte('delivered_at', dateRange.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get top error codes: ${error.message}`);
    }

    const errorCounts = new Map<string, number>();
    let totalErrors = 0;

    (data ?? []).forEach(log => {
      if (log.error_code) {
        const count = errorCounts.get(log.error_code) || 0;
        errorCounts.set(log.error_code, count + 1);
        totalErrors++;
      }
    });

    return Array.from(errorCounts.entries())
      .map(([errorCode, count]) => ({
        errorCode,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getPerformanceStats(dateRange?: { startDate: Date; endDate: Date }): Promise<{
    averageLatencyMs: number;
    medianLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    slowDeliveryCount: number;
    slowDeliveryRate: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    let query = supabaseAdmin
      .from('delivery_logs')
      .select('response_latency_ms')
      .eq('status', DeliveryStatus.Success)
      .not('response_latency_ms', 'is', null)
      .order('response_latency_ms', { ascending: true });

    if (dateRange) {
      query = query
        .gte('delivered_at', dateRange.startDate.toISOString())
        .lte('delivered_at', dateRange.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get performance stats: ${error.message}`);
    }

    const latencies = (data ?? []).map(log => log.response_latency_ms).filter(l => l !== null);
    
    if (latencies.length === 0) {
      return {
        averageLatencyMs: 0,
        medianLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        slowDeliveryCount: 0,
        slowDeliveryRate: 0,
      };
    }

    const averageLatencyMs = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const medianLatencyMs = latencies[Math.floor(latencies.length / 2)];
    const p95LatencyMs = latencies[Math.floor(latencies.length * 0.95)];
    const p99LatencyMs = latencies[Math.floor(latencies.length * 0.99)];
    
    const slowThreshold = 1000; // 1 second
    const slowDeliveryCount = latencies.filter(l => l > slowThreshold).length;
    const slowDeliveryRate = slowDeliveryCount / latencies.length;

    return {
      averageLatencyMs,
      medianLatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      slowDeliveryCount,
      slowDeliveryRate,
    };
  }

  private calculateStats(logs: any[]): {
    totalLogs: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageLatencyMs: number;
    errorCodes: { [code: string]: number };
  } {
    const totalLogs = logs.length;
    const successCount = logs.filter(l => l.status === DeliveryStatus.Success).length;
    const failureCount = logs.filter(l => l.status === DeliveryStatus.Failed).length;
    const successRate = totalLogs > 0 ? successCount / totalLogs : 0;
    
    const latencies = logs
      .filter(l => l.response_latency_ms !== null)
      .map(l => l.response_latency_ms);
    
    const averageLatencyMs = latencies.length > 0 
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0;

    const errorCodes: { [code: string]: number } = {};
    logs
      .filter(l => l.status === DeliveryStatus.Failed && l.error_code)
      .forEach(l => {
        errorCodes[l.error_code] = (errorCodes[l.error_code] || 0) + 1;
      });

    return {
      totalLogs,
      successCount,
      failureCount,
      successRate,
      averageLatencyMs,
      errorCodes,
    };
  }

  private mapToEntity(data: any): DeliveryLog {
    return DeliveryLog.reconstruct(
      data.id,
      data.batch_id,
      data.campaign_id,
      data.line_user_id,
      data.status as DeliveryStatus,
      data.error_code,
      data.error_message,
      new Date(data.delivered_at),
      data.response_latency_ms
    );
  }
}