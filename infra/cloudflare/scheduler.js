/**
 * vt-link Cloudflare Worker Scheduler
 * 毎分VercelのAPI(/api/scheduler/run)を呼び出してスケジューラを実行
 */

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event));
});

async function handleScheduled(event) {
  console.log('Scheduler triggered at:', new Date().toISOString());

  try {
    const vercelApiUrl = VERCEL_API_URL || 'https://vt-link.vercel.app';
    const schedulerSecret = SCHEDULER_SECRET;

    if (!schedulerSecret) {
      console.error('SCHEDULER_SECRET is not set');
      return;
    }

    const response = await fetch(`${vercelApiUrl}/api/scheduler/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Scheduler-Secret': schedulerSecret,
      },
      // タイムアウト設定 (30秒)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('Scheduler executed successfully:', {
      processedCount: result.processed_count,
      message: result.message,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Scheduler execution failed:', error.message);

    // エラーをCloudflare Analytics/Logsに記録
    throw error;
  }
}

// Health check endpoint (optional)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      worker: 'vt-link-scheduler'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('vt-link Scheduler Worker', {
    headers: { 'Content-Type': 'text/plain' },
  });
}