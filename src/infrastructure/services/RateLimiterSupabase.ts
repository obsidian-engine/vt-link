import { RateLimiter } from '@/domain/services/RateLimiter';
import { supabaseAdmin } from '@/infrastructure/clients/supabaseClient';

export class RateLimiterSupabase implements RateLimiter {
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
        const { error: insertError } = await supabaseAdmin
          .from('rate_limit_entries')
          .insert({
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