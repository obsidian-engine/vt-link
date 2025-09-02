import { NextRequest, NextResponse } from "next/server";
import { MessageCampaignRepositorySupabase } from "@/infrastructure/campaign/repositories/MessageCampaignRepositorySupabase";
import { DeliveryBatchRepositorySupabase } from "@/infrastructure/campaign/repositories/DeliveryBatchRepositorySupabase";
import { DeliveryLogRepositorySupabase } from "@/infrastructure/campaign/repositories/DeliveryLogRepositorySupabase";
import { LineUserRepositorySupabase } from "@/infrastructure/campaign/repositories/LineUserRepositorySupabase";
import { LineMessagingGateway } from "@/infrastructure/gateways/line/LineMessagingGateway";
import { ScheduleDeliveryUsecase } from "@/application/campaign/ScheduleDeliveryUsecase";

// Vercel Cronジョブまたは外部スケジューラーから呼び出される
export async function POST(request: NextRequest) {
  try {
    // 認証チェック（CRON_SECRET環境変数を使用）
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env["CRON_SECRET"];

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 現在時刻を取得
    const currentTime = new Date();
    console.log(
      `[CRON] Starting scheduled delivery check at ${currentTime.toISOString()}`,
    );

    // リポジトリとゲートウェイを初期化
    const campaignRepository = new MessageCampaignRepositorySupabase();
    const batchRepository = new DeliveryBatchRepositorySupabase();
    const logRepository = new DeliveryLogRepositorySupabase();
    const userRepository = new LineUserRepositorySupabase();

    // LINE公式アカウントのアクセストークンを取得
    const channelAccessToken = process.env["LINE_CHANNEL_ACCESS_TOKEN"];
    if (!channelAccessToken) {
      console.error("[CRON] LINE_CHANNEL_ACCESS_TOKEN is not configured");
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const lineGateway = new LineMessagingGateway(channelAccessToken);

    // Usecaseを初期化
    const scheduleDeliveryUsecase = new ScheduleDeliveryUsecase(
      campaignRepository,
    );

    // 送信準備ができたキャンペーンを取得
    const readyCampaigns =
      await campaignRepository.findScheduledReadyToSend(currentTime);

    if (readyCampaigns.length === 0) {
      console.log("[CRON] No campaigns ready for delivery");
      return NextResponse.json({
        message: "No campaigns ready for delivery",
        processedCount: 0,
      });
    }

    console.log(
      `[CRON] Found ${readyCampaigns.length} campaigns ready for delivery`,
    );

    // 並行処理でキャンペーンを処理
    const results = await Promise.allSettled(
      readyCampaigns.map(async (campaign) => {
        try {
          console.log(
            `[CRON] Processing campaign: ${campaign.id} (${campaign.name})`,
          );

          const result = await scheduleDeliveryUsecase.execute({
            campaignId: campaign.id,
            scheduledAt: currentTime,
          });

          console.log(
            `[CRON] Campaign ${campaign.id} processed successfully. Batches created: ${result.batchesCreated}, Total recipients: ${result.totalRecipients}`,
          );

          return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: "success",
            batchesCreated: result.batchesCreated,
            totalRecipients: result.totalRecipients,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `[CRON] Failed to process campaign ${campaign.id}:`,
            errorMessage,
          );

          return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: "error",
            error: errorMessage,
          };
        }
      }),
    );

    // 結果を集計
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success",
    ).length;
    const failed = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && r.value.status === "error"),
    ).length;

    const totalBatchesCreated = results
      .filter((r) => r.status === "fulfilled" && r.value.status === "success")
      .reduce(
        (sum, r) =>
          sum + (r.status === "fulfilled" ? r.value.batchesCreated || 0 : 0),
        0,
      );

    const totalRecipients = results
      .filter((r) => r.status === "fulfilled" && r.value.status === "success")
      .reduce(
        (sum, r) =>
          sum + (r.status === "fulfilled" ? r.value.totalRecipients || 0 : 0),
        0,
      );

    const response = {
      message: "Scheduled delivery processing completed",
      processedCount: readyCampaigns.length,
      successful,
      failed,
      totalBatchesCreated,
      totalRecipients,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Promise rejected" },
      ),
      timestamp: currentTime.toISOString(),
    };

    console.log(`[CRON] Processing completed:`, response);

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[CRON] Scheduled delivery processing failed:", errorMessage);

    return NextResponse.json(
      {
        error: "Scheduled delivery processing failed",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// ヘルスチェック用のGETエンドポイント
export async function GET() {
  return NextResponse.json({
    service: "Campaign Delivery Scheduler",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
