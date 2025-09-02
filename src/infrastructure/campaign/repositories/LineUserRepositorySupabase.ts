import { LineUser } from '@/domain/campaign/entities/LineUser';
import { LineUser } from '@/domain/campaign/entities/LineUser';
import type { LineUserRepository } from '@/domain/campaign/repositories/LineUserRepository';
import type { SegmentCriteria } from '@/domain/valueObjects/SegmentCriteria';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class LineUserRepositorySupabase implements LineUserRepository {
  async save(lineUser: LineUser): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('line_users').upsert({
      id: lineUser.id,
      account_id: lineUser.accountId,
      line_user_id: lineUser.lineUserId,
      display_name: lineUser.displayName,
      picture_url: lineUser.pictureUrl,
      status_message: lineUser.statusMessage,
      language: lineUser.language,
      gender: lineUser.gender,
      age: lineUser.age,
      region: lineUser.region,
      is_friend: lineUser.isFriend,
      blocked_at: lineUser.blockedAt?.toISOString(),
      created_at: lineUser.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save LINE user: ${error.message}`);
    }
  }

  async findById(id: string): Promise<LineUser | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('line_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find LINE user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByLineUserId(accountId: string, lineUserId: string): Promise<LineUser | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('line_users')
      .select('*')
      .eq('account_id', accountId)
      .eq('line_user_id', lineUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find LINE user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByAccountId(accountId: string): Promise<LineUser[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('line_users')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_friend', true)
      .is('blocked_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find LINE users: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findByCriteria(accountId: string, criteria: SegmentCriteria): Promise<LineUser[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    let query = supabaseAdmin
      .from('line_users')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_friend', true)
      .is('blocked_at', null);

    // Gender filtering
    if (criteria.genders && criteria.genders.size > 0) {
      query = query.in('gender', criteria.genders.genders);
    }

    // Age filtering
    if (criteria.ageRange) {
      query = query.gte('age', criteria.ageRange.min).lte('age', criteria.ageRange.max);
    }

    // Region filtering
    if (criteria.regions && criteria.regions.size > 0) {
      query = query.in('region', criteria.regions.regions);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to find LINE users by criteria: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async countByCriteria(accountId: string, criteria: SegmentCriteria): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    let query = supabaseAdmin
      .from('line_users')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('is_friend', true)
      .is('blocked_at', null);

    // Gender filtering
    if (criteria.genders && criteria.genders.size > 0) {
      query = query.in('gender', criteria.genders.genders);
    }

    // Age filtering
    if (criteria.ageRange) {
      query = query.gte('age', criteria.ageRange.min).lte('age', criteria.ageRange.max);
    }

    // Region filtering
    if (criteria.regions && criteria.regions.size > 0) {
      query = query.in('region', criteria.regions.regions);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count LINE users by criteria: ${error.message}`);
    }

    return count ?? 0;
  }

  async findActiveUsers(accountId: string, limit = 1000): Promise<LineUser[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { data, error } = await supabaseAdmin
      .from('line_users')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_friend', true)
      .is('blocked_at', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to find active LINE users: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async updateFriendStatus(
    accountId: string,
    lineUserId: string,
    isFriend: boolean
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const updateData: any = {
      is_friend: isFriend,
      updated_at: new Date().toISOString(),
    };

    if (!isFriend) {
      updateData.blocked_at = new Date().toISOString();
    } else {
      updateData.blocked_at = null;
    }

    const { error } = await supabaseAdmin
      .from('line_users')
      .update(updateData)
      .eq('account_id', accountId)
      .eq('line_user_id', lineUserId);

    if (error) {
      throw new Error(`Failed to update friend status: ${error.message}`);
    }
  }

  async getStatistics(accountId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    genderBreakdown: Record<string, number>;
    ageBreakdown: Record<string, number>;
    regionBreakdown: Record<string, number>;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    // 並列でクエリを実行してパフォーマンスを向上
    const [totalResult, activeResult, blockedResult, genderResult, ageResult, regionResult] =
      await Promise.all([
        // Total users
        supabaseAdmin
          .from('line_users')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', accountId),

        // Active users (friends, not blocked)
        supabaseAdmin
          .from('line_users')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', accountId)
          .eq('is_friend', true)
          .is('blocked_at', null),

        // Blocked users
        supabaseAdmin
          .from('line_users')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', accountId)
          .not('blocked_at', 'is', null),

        // Gender breakdown (active users only)
        supabaseAdmin
          .from('line_users')
          .select('gender')
          .eq('account_id', accountId)
          .eq('is_friend', true)
          .is('blocked_at', null),

        // Age breakdown (active users only)
        supabaseAdmin
          .from('line_users')
          .select('age')
          .eq('account_id', accountId)
          .eq('is_friend', true)
          .is('blocked_at', null)
          .not('age', 'is', null),

        // Region breakdown (active users only)
        supabaseAdmin
          .from('line_users')
          .select('region')
          .eq('account_id', accountId)
          .eq('is_friend', true)
          .is('blocked_at', null),
      ]);

    // エラーハンドリング
    const results = [
      totalResult,
      activeResult,
      blockedResult,
      genderResult,
      ageResult,
      regionResult,
    ];
    for (const result of results) {
      if (result.error) {
        throw new Error(`Failed to get user statistics: ${result.error.message}`);
      }
    }

    // Gender breakdown
    const genderBreakdown: Record<string, number> = {};
    (genderResult.data ?? []).forEach((item: any) => {
      const gender = item.gender || 'unknown';
      genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;
    });

    // Age breakdown (group by ranges)
    const ageBreakdown: Record<string, number> = {
      '10代': 0,
      '20代': 0,
      '30代': 0,
      '40代': 0,
      '50代': 0,
      '60代以上': 0,
    };
    (ageResult.data ?? []).forEach((item: any) => {
      const age = item.age;
      if (age >= 10 && age < 20) ageBreakdown['10代']++;
      else if (age >= 20 && age < 30) ageBreakdown['20代']++;
      else if (age >= 30 && age < 40) ageBreakdown['30代']++;
      else if (age >= 40 && age < 50) ageBreakdown['40代']++;
      else if (age >= 50 && age < 60) ageBreakdown['50代']++;
      else if (age >= 60) ageBreakdown['60代以上']++;
    });

    // Region breakdown
    const regionBreakdown: Record<string, number> = {};
    (regionResult.data ?? []).forEach((item: any) => {
      const region = item.region || 'unknown';
      regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
    });

    return {
      totalUsers: totalResult.count ?? 0,
      activeUsers: activeResult.count ?? 0,
      blockedUsers: blockedResult.count ?? 0,
      genderBreakdown,
      ageBreakdown,
      regionBreakdown,
    };
  }

  private mapToEntity(data: any): LineUser {
    return LineUser.reconstruct(
      data.id,
      data.account_id,
      data.line_user_id,
      data.display_name,
      data.picture_url,
      data.status_message,
      data.language,
      data.gender,
      data.age,
      data.region,
      data.is_friend,
      data.blocked_at ? new Date(data.blocked_at) : undefined,
      new Date(data.created_at)
    );
  }
}
