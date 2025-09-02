import crypto from 'node:crypto';
import { HandleWebhookUsecase } from '@/application/autoReply/HandleWebhookUsecase';
import { AutoReplyRuleRepositorySupabase } from '@/infrastructure/repositories/supabase/AutoReplyRuleRepositorySupabase';
import { ReplyLogRepositorySupabase } from '@/infrastructure/repositories/supabase/ReplyLogRepositorySupabase';
import { LineReplyServiceImpl } from '@/infrastructure/services/LineReplyServiceImpl';
import { RateLimiterSupabase } from '@/infrastructure/services/RateLimiterSupabase';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Verify LINE signature
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    if (!payload.events || !Array.isArray(payload.events)) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // Get account ID (in production, this would be determined by the webhook endpoint)
    // For now, use a default account ID
    const accountId = 'default-account';

    // Initialize dependencies
    const autoReplyRuleRepository = new AutoReplyRuleRepositorySupabase();
    const replyLogRepository = new ReplyLogRepositorySupabase();
    const rateLimiter = new RateLimiterSupabase();
    const lineReplyService = new LineReplyServiceImpl(LINE_CHANNEL_ACCESS_TOKEN!);

    // Execute webhook handling
    const usecase = new HandleWebhookUsecase(
      autoReplyRuleRepository,
      replyLogRepository,
      rateLimiter,
      lineReplyService
    );

    const result = await usecase.execute({
      events: payload.events,
      accountId,
    });

    // Log processing results
    console.log(
      `Webhook processed: ${result.processedCount} events, ${result.repliedCount} replies sent`
    );
    if (result.errors.length > 0) {
      console.error('Webhook processing errors:', result.errors);
    }

    return NextResponse.json({
      success: true,
      processed: result.processedCount,
      replied: result.repliedCount,
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error('LINE_CHANNEL_SECRET is not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return signature === `sha256=${expectedSignature}`;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
