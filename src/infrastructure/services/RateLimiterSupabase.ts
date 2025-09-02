import type { RateLimitCheck, RateLimiter } from '@/domain/services/RateLimiter';
import type { RateLimit } from '@/domain/services/RateLimiter';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class RateLimiterSupabase implements RateLimiter {
  async check(key: string, rateLimit: RateLimit): Promise<RateLimitCheck> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - rateLimit.windowSeconds * 60 * 1000);

    const { count, error } = await supabaseAdmin
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      throw new Error(`Failed to check rate limit: ${error.message}`);
    }

    const currentCount = count ?? 0;
    const allowed = currentCount < rateLimit.limit;
    const resetTime = new Date(now.getTime() + rateLimit.windowSeconds * 1000);
    const remainingCount = Math.max(0, rateLimit.limit - currentCount);

    return {
      allowed,
      currentCount,
      limit: rateLimit.limit,
      resetTime,
      remainingCount,
    };
  }

  async increment(key: string, rateLimit: RateLimit): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('rate_limits').insert({
      key,
      count: 1,
      window_seconds: rateLimit.windowSeconds,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to increment rate limit: ${error.message}`);
    }
  }

  async reset(key: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const { error } = await supabaseAdmin.from('rate_limits').delete().eq('key', key);

    if (error) {
      throw new Error(`Failed to reset rate limit: ${error.message}`);
    }
  }

  async getCount(key: string, rateLimit: RateLimit): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - rateLimit.windowSeconds * 60 * 1000);

    const { count, error } = await supabaseAdmin
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      throw new Error(`Failed to get rate limit count: ${error.message}`);
    }

    return count ?? 0;
  }
  async checkLimit(key: string, limit: number, windowMinutes: number): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required');
    }

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    try {
      // Count existing entries within the time window
      const { count, error: countError } = await supabaseAdmin
        .from('rate_limit_entries')
        .select('*', { count: 'exact', head: true })
        .eq('key', key)
        .gte('created_at', windowStart.toISOString());

      if (countError) {
        throw new Error(`Failed to check rate limit: ${countError.message}`);
      }

      const currentCount = count ?? 0;

      // If within limit, record this request
      if (currentCount < limit) {
        const { error: insertError } = await supabaseAdmin.from('rate_limit_entries').insert({
          key,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          throw new Error(`Failed to record rate limit entry: ${insertError.message}`);
        }

        // Clean up old entries (optional optimization)
        await this.cleanupOldEntries(key, windowStart);

        return true;
      }

      return false;
    } catch (error) {
      // In case of database errors, fail open (allow the request)
      console.error('Rate limiter error:', error);
      return true;
    }
  }

  private async cleanupOldEntries(key: string, windowStart: Date): Promise<void> {
    try {
      await supabaseAdmin
        .from('rate_limit_entries')
        .delete()
        .eq('key', key)
        .lt('created_at', windowStart.toISOString());
    } catch (error) {
      // Log but don't throw - cleanup is optional
      console.warn('Failed to cleanup old rate limit entries:', error);
    }
  }
}
