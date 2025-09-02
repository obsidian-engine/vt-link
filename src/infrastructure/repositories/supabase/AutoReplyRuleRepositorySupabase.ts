import { AutoReplyRule } from "@/domain/entities/AutoReplyRule";
import type { AutoReplyRuleRepository } from "@/domain/repositories/AutoReplyRuleRepository";
import { AutoReplyRule } from "@/domain/entities/AutoReplyRule";
import { Condition } from "@/domain/entities/Condition";
import { Response } from "@/domain/entities/Response";
import { RateLimit } from "@/domain/entities/RateLimit";
import { TimeWindow } from "@/domain/entities/TimeWindow";
import { supabaseAdmin } from "@/infrastructure/clients/supabaseClient";

export class AutoReplyRuleRepositorySupabase
  implements AutoReplyRuleRepository
{
  async save(rule: AutoReplyRule): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    const { error } = await supabaseAdmin.from("auto_reply_rules").upsert({
      id: rule.id,
      account_id: rule.accountId,
      name: rule.name,
      conditions: rule.conditions.map((c) => c.toJSON()),
      responses: rule.responses.map((r) => r.toJSON()),
      enabled: rule.enabled,
      priority: rule.priority,
      rate_limit: rule.rateLimit
        ? {
            count: rule.rateLimit.count,
            window_minutes: rule.rateLimit.windowMinutes,
            scope: rule.rateLimit.scope,
          }
        : null,
      time_window: rule.timeWindow
        ? {
            start_hour: rule.timeWindow.startHour,
            end_hour: rule.timeWindow.endHour,
            timezone: rule.timeWindow.timezone,
            days_of_week: rule.timeWindow.daysOfWeek,
          }
        : null,
    });

    if (error) {
      throw new Error(`Failed to save auto reply rule: ${error.message}`);
    }
  }

  async findById(id: string): Promise<AutoReplyRule | null> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    const { data, error } = await supabaseAdmin
      .from("auto_reply_rules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find auto reply rule: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findAllByAccountId(accountId: string): Promise<AutoReplyRule[]> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    const { data, error } = await supabaseAdmin
      .from("auto_reply_rules")
      .select("*")
      .eq("account_id", accountId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find auto reply rules: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async findActiveByAccountId(accountId: string): Promise<AutoReplyRule[]> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    const { data, error } = await supabaseAdmin
      .from("auto_reply_rules")
      .select("*")
      .eq("account_id", accountId)
      .eq("enabled", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to find active auto reply rules: ${error.message}`,
      );
    }

    return (data ?? []).map((item) => this.mapToEntity(item));
  }

  async delete(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    const { error } = await supabaseAdmin
      .from("auto_reply_rules")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete auto reply rule: ${error.message}`);
    }
  }

  async updatePriorities(
    accountId: string,
    rulePriorities: Array<{ id: string; priority: number }>,
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error("Supabase service role key is required");
    }

    // Update priorities in a transaction
    for (const rp of rulePriorities) {
      const { error } = await supabaseAdmin
        .from("auto_reply_rules")
        .update({ priority: rp.priority })
        .eq("id", rp.id)
        .eq("account_id", accountId);

      if (error) {
        throw new Error(
          `Failed to update priority for rule ${rp.id}: ${error.message}`,
        );
      }
    }
  }

  private mapToEntity(data: any): AutoReplyRule {
    // Reconstruct conditions from JSON
    const conditions = data.conditions.map((conditionData: any) => {
      return Condition.fromJSON(conditionData);
    });

    // Reconstruct responses from JSON
    const responses = data.responses.map((responseData: any) => {
      return Response.fromJSON(responseData);
    });

    // Reconstruct rate limit if exists
    const rateLimit = data.rate_limit
      ? RateLimit.reconstruct(
          data.rate_limit.count,
          data.rate_limit.window_minutes,
          data.rate_limit.scope,
        )
      : null;

    // Reconstruct time window if exists
    const timeWindow = data.time_window
      ? TimeWindow.reconstruct(
          data.time_window.start_hour,
          data.time_window.end_hour,
          data.time_window.timezone,
          data.time_window.days_of_week,
        )
      : null;

    return AutoReplyRule.reconstruct(
      data.id,
      data.account_id,
      data.name,
      data.priority,
      conditions,
      responses,
      rateLimit,
      timeWindow,
      data.enabled,
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }
}
