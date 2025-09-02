/**
 * 環境変数の型定義
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Application
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly APP_ENV: string;
      readonly APP_PORT: string;
      readonly APP_HOST: string;
      readonly APP_NAME: string;
      readonly APP_VERSION: string;
      readonly LOG_LEVEL: string;

      // Database (PostgreSQL)
      readonly DB_HOST: string;
      readonly DB_PORT: string;
      readonly DB_USER: string;
      readonly DB_PASSWORD: string;
      readonly DB_NAME: string;
      readonly DB_SSL_MODE: string;
      readonly DB_MAX_OPEN_CONNS: string;
      readonly DB_MAX_IDLE_CONNS: string;
      readonly DB_CONN_MAX_LIFETIME: string;
      readonly DB_DSN: string;

      // Redis
      readonly REDIS_HOST: string;
      readonly REDIS_PORT: string;
      readonly REDIS_PASSWORD: string;
      readonly REDIS_DB: string;
      readonly REDIS_POOL_SIZE: string;
      readonly REDIS_MIN_IDLE_CONNS: string;

      // MinIO (S3-compatible storage)
      readonly MINIO_ENDPOINT: string;
      readonly MINIO_ROOT_USER: string;
      readonly MINIO_ROOT_PASSWORD: string;
      readonly MINIO_USE_SSL: string;
      readonly MINIO_MEDIA_BUCKET: string;
      readonly MINIO_BACKUP_BUCKET: string;

      // Authentication (Google OAuth)
      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;
      readonly GOOGLE_REDIRECT_URL: string;

      // Session
      readonly SESSION_SECRET: string;
      readonly SESSION_NAME: string;
      readonly SESSION_MAX_AGE: string;
      readonly SESSION_SECURE: string;
      readonly SESSION_HTTP_ONLY: string;
      readonly SESSION_SAME_SITE: string;

      // LINE Messaging API
      readonly LINE_CHANNEL_ID: string;
      readonly LINE_CHANNEL_SECRET: string;
      readonly LINE_CHANNEL_ACCESS_TOKEN: string;
      readonly LINE_WEBHOOK_URL: string;

      // CORS
      readonly CORS_ALLOWED_ORIGINS: string;
      readonly CORS_ALLOWED_METHODS: string;
      readonly CORS_ALLOWED_HEADERS: string;
      readonly CORS_ALLOW_CREDENTIALS: string;

      // GraphQL
      readonly GRAPHQL_PLAYGROUND_ENABLED: string;
      readonly GRAPHQL_INTROSPECTION_ENABLED: string;
      readonly GRAPHQL_COMPLEXITY_LIMIT: string;
      readonly GRAPHQL_DEPTH_LIMIT: string;

      // Rate Limiting
      readonly RATE_LIMIT_ENABLED: string;
      readonly RATE_LIMIT_REQUESTS_PER_MINUTE: string;
      readonly RATE_LIMIT_BURST: string;

      // Monitoring
      readonly PROMETHEUS_ENABLED: string;
      readonly PROMETHEUS_PORT: string;
      readonly SENTRY_DSN: string;
      readonly SENTRY_ENVIRONMENT: string;
      readonly SENTRY_SAMPLE_RATE: string;

      // Job Queue (asynq)
      readonly JOB_QUEUE_CONCURRENCY: string;
      readonly JOB_QUEUE_RETRY_MAX: string;
      readonly JOB_QUEUE_RETRY_DELAY: string;

      // File Upload
      readonly MAX_UPLOAD_SIZE: string;
      readonly ALLOWED_IMAGE_TYPES: string;
      readonly IMAGE_QUALITY: string;

      // Timezone
      readonly TZ: string;

      // Supabase (Next.js Frontend)
      readonly NEXT_PUBLIC_SUPABASE_URL: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      readonly SUPABASE_SERVICE_ROLE_KEY: string;
      readonly SUPABASE_PROJECT_REF?: string;
      readonly SUPABASE_DB_URL?: string;
      readonly DATABASE_URL?: string;

      // OpenAI
      readonly OPENAI_API_KEY?: string;

      // Cron Jobs
      readonly CRON_SECRET?: string;
    }
  }
}

export {};
