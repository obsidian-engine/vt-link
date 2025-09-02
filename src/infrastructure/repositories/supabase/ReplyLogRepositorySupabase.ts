import { ReplyLog } from '@/domain/entities/ReplyLog';
import { ReplyLogRepository } from '@/domain/repositories/ReplyLogRepository';
import { Response } from '@/domain/entities/Response';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class ReplyLogRepositorySupabase implements ReplyLogRepository {
  async save(log: ReplyLog): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin
      .from('reply_logs')
      .insert({
        id: log.id,
        account_id: log.accountId,
        rule_id: log.ruleId,
        message_id: log.messageId,
        user_id: log.userId,
        source_type: log.sourceType,
        source_id: log.sourceId,
        response_content: log.responseContent.map(r => r.toJSON()),
        replied_at: log.repliedAt.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save reply log: ${error.message}`);
    }
  }

  async findByAccountId(accountId: string, limit: number = 100): Promise<ReplyLog[]> {
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

    return (data ?? []).map(item => this.mapToEntity(item));
  }

  async findByRuleId(ruleId: string, limit: number = 100): Promise<ReplyLog[]> {
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

    return (data ?? []).map(item => this.mapToEntity(item));
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

  private mapToEntity(data: any): ReplyLog {
    // Reconstruct response content from JSON
    const responseContent = data.response_content.map((responseData: any) => {
      return Response.fromJSON(responseData);
    });

    return ReplyLog.reconstruct(
      data.id,
      data.account_id,
      data.rule_id,
      data.message_id,
      data.user_id,
      data.source_type,
      data.source_id,
      responseContent,
      new Date(data.replied_at)
    );
  }
}