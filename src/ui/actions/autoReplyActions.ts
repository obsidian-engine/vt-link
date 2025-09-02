"use server";

import { CreateAutoReplyRuleUsecase } from "@/application/autoReply/CreateAutoReplyRuleUsecase";
import { GetAutoReplyRulesUsecase } from "@/application/autoReply/GetAutoReplyRulesUsecase";
import { AutoReplyRuleRepositorySupabase } from "@/infrastructure/repositories/supabase/AutoReplyRuleRepositorySupabase";
import { revalidatePath } from "next/cache";

export async function createAutoReplyRule(formData: FormData) {
  try {
    const accountId = formData.get("accountId") as string;
    const name = formData.get("name") as string;
    const conditionsJson = formData.get("conditions") as string;
    const responsesJson = formData.get("responses") as string;
    const enabled = formData.get("enabled") === "true";
    const priority = parseInt(formData.get("priority") as string) || 0;
    const rateLimitJson = formData.get("rateLimit") as string;
    const timeWindowJson = formData.get("timeWindow") as string;

    if (!accountId) {
      throw new Error("Account ID is required");
    }

    if (!name) {
      throw new Error("Name is required");
    }

    // Parse conditions
    let conditions = [];
    if (conditionsJson) {
      try {
        conditions = JSON.parse(conditionsJson);
      } catch (parseError) {
        throw new Error("Invalid conditions data");
      }
    }

    // Parse responses
    let responses = [];
    if (responsesJson) {
      try {
        responses = JSON.parse(responsesJson);
      } catch (parseError) {
        throw new Error("Invalid responses data");
      }
    }

    // Parse rate limit
    let rateLimit = null;
    if (rateLimitJson) {
      try {
        rateLimit = JSON.parse(rateLimitJson);
      } catch (parseError) {
        throw new Error("Invalid rate limit data");
      }
    }

    // Parse time window
    let timeWindow = null;
    if (timeWindowJson) {
      try {
        timeWindow = JSON.parse(timeWindowJson);
      } catch (parseError) {
        throw new Error("Invalid time window data");
      }
    }

    const repository = new AutoReplyRuleRepositorySupabase();
    const usecase = new CreateAutoReplyRuleUsecase(repository);

    const result = await usecase.execute({
      accountId,
      name,
      conditions,
      responses,
      enabled,
      priority,
      rateLimit,
      timeWindow,
    });

    revalidatePath("/dashboard/auto-reply");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getAutoReplyRules(accountId: string) {
  try {
    if (!accountId) {
      throw new Error("Account ID is required");
    }

    const repository = new AutoReplyRuleRepositorySupabase();
    const usecase = new GetAutoReplyRulesUsecase(repository);

    const result = await usecase.execute({ accountId });

    return {
      success: true,
      data: result.rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        enabled: rule.enabled,
        priority: rule.priority,
        conditionsCount: rule.conditions.length,
        responsesCount: rule.responses.length,
        createdAt: rule.createdAt,
      })),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}
