import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { 
  Campaign, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CampaignListResponse,
  CampaignResponse,
  Fan,
  FanListResponse,
  FanResponse,
  ApiError,
  ApiSuccess
} from './schemas/index.js'

const registry = new OpenAPIRegistry()

// Schemas を登録
registry.register('Campaign', Campaign)
registry.register('CreateCampaignRequest', CreateCampaignRequest)
registry.register('UpdateCampaignRequest', UpdateCampaignRequest)
registry.register('CampaignListResponse', CampaignListResponse)
registry.register('CampaignResponse', CampaignResponse)
registry.register('Fan', Fan)
registry.register('FanListResponse', FanListResponse)
registry.register('FanResponse', FanResponse)
registry.register('ApiError', ApiError)
registry.register('ApiSuccess', ApiSuccess)

// API パスの定義
registry.registerPath({
  method: 'get',
  path: '/api/v1/campaigns',
  description: 'キャンペーン一覧を取得',
  summary: 'キャンペーン一覧取得',
  tags: ['campaigns'],
  parameters: [
    {
      name: 'page',
      in: 'query',
      description: 'ページ番号',
      required: false,
      schema: { type: 'integer', minimum: 1, default: 1 }
    },
    {
      name: 'limit',
      in: 'query',
      description: '1ページあたりの件数',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    }
  ],
  responses: {
    200: {
      description: 'キャンペーン一覧',
      content: {
        'application/json': {
          schema: CampaignListResponse
        }
      }
    },
    400: {
      description: 'バリデーションエラー',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/campaigns',
  description: 'キャンペーンを作成',
  summary: 'キャンペーン作成',
  tags: ['campaigns'],
  requestBody: {
    content: {
      'application/json': {
        schema: CreateCampaignRequest
      }
    }
  },
  responses: {
    201: {
      description: '作成されたキャンペーン',
      content: {
        'application/json': {
          schema: CampaignResponse
        }
      }
    },
    400: {
      description: 'バリデーションエラー',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/campaigns/{id}',
  description: 'キャンペーン詳細を取得',
  summary: 'キャンペーン詳細取得',
  tags: ['campaigns'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'キャンペーンID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: 'キャンペーン詳細',
      content: {
        'application/json': {
          schema: CampaignResponse
        }
      }
    },
    404: {
      description: 'キャンペーンが見つかりません',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

registry.registerPath({
  method: 'put',
  path: '/api/v1/campaigns/{id}',
  description: 'キャンペーンを更新',
  summary: 'キャンペーン更新',
  tags: ['campaigns'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'キャンペーンID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: UpdateCampaignRequest
      }
    }
  },
  responses: {
    200: {
      description: '更新されたキャンペーン',
      content: {
        'application/json': {
          schema: CampaignResponse
        }
      }
    },
    404: {
      description: 'キャンペーンが見つかりません',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/campaigns/{id}',
  description: 'キャンペーンを削除',
  summary: 'キャンペーン削除',
  tags: ['campaigns'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'キャンペーンID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: '削除成功',
      content: {
        'application/json': {
          schema: ApiSuccess
        }
      }
    },
    404: {
      description: 'キャンペーンが見つかりません',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/fans',
  description: 'ファン一覧を取得',
  summary: 'ファン一覧取得',
  tags: ['fans'],
  parameters: [
    {
      name: 'page',
      in: 'query',
      description: 'ページ番号',
      required: false,
      schema: { type: 'integer', minimum: 1, default: 1 }
    },
    {
      name: 'limit',
      in: 'query',
      description: '1ページあたりの件数',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    }
  ],
  responses: {
    200: {
      description: 'ファン一覧',
      content: {
        'application/json': {
          schema: FanListResponse
        }
      }
    }
  }
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/fans/{id}',
  description: 'ファン詳細を取得',
  summary: 'ファン詳細取得',
  tags: ['fans'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ファンID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: 'ファン詳細',
      content: {
        'application/json': {
          schema: FanResponse
        }
      }
    },
    404: {
      description: 'ファンが見つかりません',
      content: {
        'application/json': {
          schema: ApiError
        }
      }
    }
  }
})

const generator = new OpenApiGeneratorV3(registry.definitions)

const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'VT-Link Manager API',
    description: 'VTuber向けLINE公式アカウント統合管理プラットフォーム API',
    contact: {
      name: 'VT-Link Team',
      email: 'api@vt-link.example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'ローカル開発環境'
    },
    {
      url: 'https://api.vt-link.example.com',
      description: '本番環境'
    }
  ],
  tags: [
    {
      name: 'campaigns',
      description: 'キャンペーン管理API'
    },
    {
      name: 'fans',
      description: 'ファン管理API'
    }
  ]
})

// OpenAPI 仕様をファイルに出力
const outputPath = join(process.cwd(), 'openapi.yaml')
writeFileSync(outputPath, JSON.stringify(document, null, 2))

console.log(`✅ OpenAPI specification generated: ${outputPath}`)