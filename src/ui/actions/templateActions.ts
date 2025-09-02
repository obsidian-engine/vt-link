"use server";

import { CreateTemplateUsecase } from "@/application/campaign/CreateTemplateUsecase";
import { MessageTemplateRepositorySupabase } from "@/infrastructure/campaign/repositories/MessageTemplateRepositorySupabase";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
  try {
    const accountId = formData.get("accountId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const contentJson = formData.get("content") as string;

    if (!accountId) {
      throw new Error("Account ID is required");
    }

    if (!name) {
      throw new Error("Template name is required");
    }

    // コンテンツをパース
    let content;
    if (contentJson) {
      try {
        content = JSON.parse(contentJson);
      } catch (parseError) {
        throw new Error("Invalid content data");
      }
    }

    const repository = new MessageTemplateRepositorySupabase();
    const usecase = new CreateTemplateUsecase(repository);

    const result = await usecase.execute({
      accountId,
      name,
      description,
      category,
      content,
    });

    revalidatePath("/dashboard/templates");

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

export async function getTemplates(accountId: string) {
  try {
    if (!accountId) {
      throw new Error("Account ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const templates = await repository.findByAccountId(accountId);

    return {
      success: true,
      data: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        content: template.content,
        placeholders: template.placeholders,
        contentType: template.getContentType(),
        usageCount: template.usageCount,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
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

export async function getTemplateById(templateId: string) {
  try {
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const template = await repository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    return {
      success: true,
      data: {
        id: template.id,
        accountId: template.accountId,
        name: template.name,
        description: template.description,
        category: template.category,
        content: template.content,
        placeholders: template.placeholders,
        contentType: template.getContentType(),
        usageCount: template.usageCount,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
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

export async function updateTemplate(templateId: string, formData: FormData) {
  try {
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const contentJson = formData.get("content") as string;

    if (!name) {
      throw new Error("Template name is required");
    }

    // コンテンツをパース
    let content;
    if (contentJson) {
      try {
        content = JSON.parse(contentJson);
      } catch (parseError) {
        throw new Error("Invalid content data");
      }
    }

    const repository = new MessageTemplateRepositorySupabase();
    const template = await repository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    const updatedTemplate = template
      .updateContent(content)
      .updateBasicInfo(name, description, category);

    await repository.save(updatedTemplate);

    revalidatePath("/dashboard/templates");
    revalidatePath(`/dashboard/templates/${templateId}`);

    return {
      success: true,
      data: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        category: updatedTemplate.category,
      },
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

export async function deleteTemplate(templateId: string) {
  try {
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const template = await repository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    await repository.delete(templateId);

    revalidatePath("/dashboard/templates");

    return {
      success: true,
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

export async function duplicateTemplate(templateId: string) {
  try {
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const originalTemplate = await repository.findById(templateId);

    if (!originalTemplate) {
      throw new Error("Template not found");
    }

    const usecase = new CreateTemplateUsecase(repository);

    const result = await usecase.execute({
      accountId: originalTemplate.accountId,
      name: `${originalTemplate.name} (コピー)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      content: originalTemplate.content,
    });

    revalidatePath("/dashboard/templates");

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

export async function getTemplatesByCategory(
  accountId: string,
  category: string,
) {
  try {
    if (!accountId) {
      throw new Error("Account ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const templates = await repository.findByCategory(accountId, category);

    return {
      success: true,
      data: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        placeholders: template.placeholders,
        contentType: template.getContentType(),
        usageCount: template.usageCount,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
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

export async function previewTemplate(
  templateId: string,
  placeholderDataJson?: string,
) {
  try {
    if (!templateId) {
      throw new Error("Template ID is required");
    }

    const repository = new MessageTemplateRepositorySupabase();
    const template = await repository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    // プレースホルダーデータをパース
    let placeholderData = {};
    if (placeholderDataJson) {
      try {
        placeholderData = JSON.parse(placeholderDataJson);
      } catch (parseError) {
        throw new Error("Invalid placeholder data");
      }
    }

    const previewContent = template.applyPlaceholders(placeholderData);

    return {
      success: true,
      data: {
        content: previewContent,
        placeholders: template.placeholders,
        contentType: template.getContentType(),
      },
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
