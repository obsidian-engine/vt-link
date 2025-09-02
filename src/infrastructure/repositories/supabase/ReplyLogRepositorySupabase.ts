import { ReplyLog } from '@/domain/entities/ReplyLog';
import type {
  ReplyLogRepository,
  ReplyLogSearchCriteria,
  ReplyLogStats,
} from '@/domain/repositories/ReplyLogRepository';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class ReplyLogRepositorySupabase implements ReplyLogRepository {
  async save(log: ReplyLog): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('reply_logs').insert({
      id: log.id,
      account_id: log.accountId,
      rule_id: log.ruleId,
      message_id: log.messageId,
      user_id: log.userId,
      matched_text: log.matchedText,
      response_type: log.responseType,
      response_content: log.responseContent,
      status: log.status,
      error: log.error,
      latency_ms: log.latencyMs,
      replied_at: log.timestamp.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save reply log: ${error.message}`);
    }
  }

  async findByAccountId(accountId: string, limit = 100): Promise<ReplyLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('reply_logs')
      .select('*')
      .eq('account_id', accountId)
      .order('replied_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find reply logs: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findByRuleId(ruleId: string, limit = 100): Promise<ReplyLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('reply_logs')
      .select('*')
      .eq('rule_id', ruleId)
      .order('replied_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find reply logs by rule: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async countByAccountIdSince(accountId: string, since: Date): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('reply_logs')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('replied_at', since.toISOString());

    if (error) {
      throw new Error(`Failed to count reply logs: ${error.message}`);
    }

    return count ?? 0;
  }

  async findById(id: string): Promise<ReplyLog | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('reply_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find reply log: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async search(criteria: ReplyLogSearchCriteria): Promise<ReplyLog[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    let query = supabaseAdmin.from('reply_logs').select('*').eq('account_id', criteria.accountId);

    if (criteria.userId) query = query.eq('user_id', criteria.userId);
    if (criteria.ruleId) query = query.eq('rule_id', criteria.ruleId);
    if (criteria.startDate) query = query.gte('replied_at', criteria.startDate.toISOString());
    if (criteria.endDate) query = query.lte('replied_at', criteria.endDate.toISOString());

    query = query.order('replied_at', { ascending: false }).limit(criteria.limit ?? 100);

    if (criteria.offset)
      query = query.range(criteria.offset, criteria.offset + (criteria.limit ?? 100) - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search reply logs: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async getStats(
    criteria: Omit<ReplyLogSearchCriteria, 'limit' | 'offset'>
  ): Promise<ReplyLogStats> {
    // TODO: 実装を完了させる
    throw new Error('ReplyLogRepositorySupabase.getStats: Method not implemented');
  }

  async deleteOlderThan(date: Date): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('reply_logs')
      .delete({ count: 'exact' })
      .lt('replied_at', date.toISOString());

    if (error) {
      throw new Error(`Failed to delete old reply logs: ${error.message}`);
    }

    return count ?? 0;
  }

  private mapToEntity(data: any): ReplyLog {
    return ReplyLog.reconstruct(
      data.id,
      data.rule_id,
      data.account_id,
      data.user_id,
      data.group_id,
      data.room_id,
      data.message_id,
      data.matched_text,
      data.response_type,
      data.response_content,
      data.status,
      data.error,
      data.latency_ms,
      new Date(data.replied_at)
    );
  }
}
