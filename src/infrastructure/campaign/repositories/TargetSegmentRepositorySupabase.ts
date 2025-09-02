import { type LineUser, TargetSegment } from '@/domain/campaign/entities/TargetSegment';
import type { TargetSegmentRepository } from '@/domain/campaign/repositories/TargetSegmentRepository';
import { SegmentCriteria } from '@/domain/valueObjects/SegmentCriteria';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class TargetSegmentRepositorySupabase implements TargetSegmentRepository {
  async save(segment: TargetSegment): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('target_segments').upsert({
      id: segment.id,
      account_id: segment.accountId,
      name: segment.name,
      description: segment.description,
      criteria: segment.criteria.toJSON(),
      is_active: segment.isActive,
      estimated_size: segment.estimatedSize,
      created_at: segment.createdAt.toISOString(),
      updated_at: segment.updatedAt.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save target segment: ${error.message}`);
    }
  }

  async findById(id: string): Promise<TargetSegment | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('target_segments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find target segment: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByAccountId(accountId: string): Promise<TargetSegment[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('target_segments')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find target segments: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findActiveByAccountId(accountId: string): Promise<TargetSegment[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('target_segments')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find active target segments: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findByNamePattern(accountId: string, namePattern: string): Promise<TargetSegment[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('target_segments')
      .select('*')
      .eq('account_id', accountId)
      .ilike('name', `%${namePattern}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search target segments: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('target_segments').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete target segment: ${error.message}`);
    }
  }

  async countByAccountId(accountId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('target_segments')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to count target segments: ${error.message}`);
    }

    return count ?? 0;
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { count, error } = await supabaseAdmin
      .from('target_segments')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to count active target segments: ${error.message}`);
    }

    return count ?? 0;
  }

  async updateEstimatedSize(segmentId: string, users: LineUser[]): Promise<void> {
    const segment = await this.findById(segmentId);
    if (!segment) {
      throw new Error(`Segment not found: ${segmentId}`);
    }

    const matchingUsers = segment.filterUsers(users);
    const updatedSegment = segment.updateEstimatedSize(matchingUsers.length);

    await this.save(updatedSegment);
  }

  private mapToEntity(data: any): TargetSegment {
    const criteria = SegmentCriteria.reconstruct(data.criteria);

    return TargetSegment.reconstruct(
      data.id,
      data.account_id,
      data.name,
      data.description,
      criteria,
      data.is_active,
      data.estimated_size,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
