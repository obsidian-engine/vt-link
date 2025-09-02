import { NextRequest, NextResponse } from 'next/server';
import { DeliveryBatchRepositorySupabase } from '@/infrastructure/campaign/repositories/DeliveryBatchRepositorySupabase';
import { DeliveryLogRepositorySupabase } from '@/infrastructure/campaign/repositories/DeliveryLogRepositorySupabase';
import { MessageCampaignRepositorySupabase } from '@/infrastructure/campaign/repositories/MessageCampaignRepositorySupabase';
import { LineMessagingGateway } from '@/infrastructure/gateways/line/LineMessagingGateway';
import { ExecuteBatchUsecase } from '@/application/campaign/ExecuteBatchUsecase';

// バッチ実行用のCronジョブエンドポイント
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env['CRON_SECRET'];
    
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentTime = new Date();
    console.log(`[BATCH_EXECUTOR] Starting batch execution at ${currentTime.toISOString()}`);

    // リポジトリとゲートウェイを初期化
    const batchRepository = new DeliveryBatchRepositorySupabase();
    const logRepository = new DeliveryLogRepositorySupabase();
    const campaignRepository = new MessageCampaignRepositorySupabase();

    const channelAccessToken = process.env['LINE_CHANNEL_ACCESS_TOKEN'];
    if (!channelAccessToken) {
      console.error('[BATCH_EXECUTOR] LINE_CHANNEL_ACCESS_TOKEN is not configured');
      return NextResponse.json(
        { error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const lineGateway = new LineMessagingGateway(channelAccessToken);

    // Usecaseを初期化
    const executeBatchUsecase = new ExecuteBatchUsecase(
      batchRepository,
      logRepository,
      campaignRepository,
      lineGateway
    );

    // 実行準備ができたバッチを取得（最大10件まで並行処理）
    const readyBatches = await batchRepository.findReadyToSend(currentTime, 10);
    
    if (readyBatches.length === 0) {
      console.log('[BATCH_EXECUTOR] No batches ready for execution');
      return NextResponse.json({
        message: 'No batches ready for execution',
        processedCount: 0,
      });
    }

    console.log(`[BATCH_EXECUTOR] Found ${readyBatches.length} batches ready for execution`);

    // 並行処理でバッチを実行（ただし、LINE APIのレート制限を考慮）
    const results = await Promise.allSettled(
      readyBatches.map(async (batch, index) => {
        try {
          // スタッガード実行（500ms間隔でバッチを開始してレート制限を回避）
          await new Promise(resolve => setTimeout(resolve, index * 500));
          
          console.log(`[BATCH_EXECUTOR] Executing batch: ${batch.id} for campaign: ${batch.campaignId}`);
          
          const result = await executeBatchUsecase.execute({
            batchId: batch.id,
          });

          console.log(`[BATCH_EXECUTOR] Batch ${batch.id} executed successfully. Sent: ${result.sentCount}, Failed: ${result.failedCount}`);
          
          return {
            batchId: batch.id,
            campaignId: batch.campaignId,
            status: 'success',
            sentCount: result.sentCount,
            failedCount: result.failedCount,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[BATCH_EXECUTOR] Failed to execute batch ${batch.id}:`, errorMessage);
          
          return {
            batchId: batch.id,
            campaignId: batch.campaignId,
            status: 'error',
            error: errorMessage,
          };
        }
      })
    );

    // 結果を集計
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'error')).length;
    
    const totalSent = results
      .filter(r => r.status === 'fulfilled' && r.value.status === 'success')
      .reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.sentCount || 0 : 0), 0);
      
    const totalFailed = results
      .filter(r => r.status === 'fulfilled' && r.value.status === 'success')
      .reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.failedCount || 0 : 0), 0);

    const response = {
      message: 'Batch execution completed',
      processedCount: readyBatches.length,
      successful,
      failed,
      totalSent,
      totalFailed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' }),
      timestamp: currentTime.toISOString(),
    };

    console.log(`[BATCH_EXECUTOR] Execution completed:`, response);

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[BATCH_EXECUTOR] Batch execution failed:', errorMessage);
    
    return NextResponse.json(
      {
        error: 'Batch execution failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ヘルスチェック用のGETエンドポイント
export async function GET() {
  return NextResponse.json({
    service: 'Delivery Batch Executor',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}