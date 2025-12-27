import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { 
  Message, 
  CreateMessageRequest, 
  UpdateMessageRequest,
  MessageListResponse,
  MessageResponse,
  Fan,
  FanListResponse,
  FanResponse,
  AutoReplyRule,
  CreateAutoReplyRuleRequest,
  UpdateAutoReplyRuleRequest,
  AutoReplyRuleListResponse,
  AutoReplyRuleResponse,
  RichMenu,
  CreateRichMenuRequest,
  UpdateRichMenuRequest,
  RichMenuListResponse,
  RichMenuResponse,
  ApiError,
  ApiSuccess
} from './schemas/index.js'

const registry = new OpenAPIRegistry()

// Schemas を登録
registry.register('Message', Message)
registry.register('CreateMessageRequest', CreateMessageRequest)
registry.register('UpdateMessageRequest', UpdateMessageRequest)
registry.register('MessageListResponse', MessageListResponse)
registry.register('MessageResponse', MessageResponse)
registry.register('Fan', Fan)
registry.register('FanListResponse', FanListResponse)
registry.register('FanResponse', FanResponse)
registry.register('AutoReplyRule', AutoReplyRule)
registry.register('CreateAutoReplyRuleRequest', CreateAutoReplyRuleRequest)
registry.register('UpdateAutoReplyRuleRequest', UpdateAutoReplyRuleRequest)
registry.register('AutoReplyRuleListResponse', AutoReplyRuleListResponse)
registry.register('AutoReplyRuleResponse', AutoReplyRuleResponse)
registry.register('RichMenu', RichMenu)
registry.register('CreateRichMenuRequest', CreateRichMenuRequest)
registry.register('UpdateRichMenuRequest', UpdateRichMenuRequest)
registry.register('RichMenuListResponse', RichMenuListResponse)
registry.register('RichMenuResponse', RichMenuResponse)
registry.register('ApiError', ApiError)
registry.register('ApiSuccess', ApiSuccess)

// API パスの定義
registry.registerPath({
  method: 'get',
  path: '/api/v1/messages',
  description: 'メッセージ一覧を取得',
  summary: 'メッセージ一覧取得',
  tags: ['messages'],
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
      description: 'メッセージ一覧',
      content: {
        'application/json': {
          schema: MessageListResponse
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
  path: '/api/v1/messages',
  description: 'メッセージを作成',
  summary: 'メッセージ作成',
  tags: ['messages'],
  requestBody: {
    content: {
      'application/json': {
        schema: CreateMessageRequest
      }
    }
  },
  responses: {
    201: {
      description: '作成されたメッセージ',
      content: {
        'application/json': {
          schema: MessageResponse
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
  path: '/api/v1/messages/{id}',
  description: 'メッセージ詳細を取得',
  summary: 'メッセージ詳細取得',
  tags: ['messages'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'メッセージID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: 'メッセージ詳細',
      content: {
        'application/json': {
          schema: MessageResponse
        }
      }
    },
    404: {
      description: 'メッセージが見つかりません',
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
  path: '/api/v1/messages/{id}',
  description: 'メッセージを更新',
  summary: 'メッセージ更新',
  tags: ['messages'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'メッセージID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: UpdateMessageRequest
      }
    }
  },
  responses: {
    200: {
      description: '更新されたメッセージ',
      content: {
        'application/json': {
          schema: MessageResponse
        }
      }
    },
    404: {
      description: 'メッセージが見つかりません',
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
  path: '/api/v1/messages/{id}',
  description: 'メッセージを削除',
  summary: 'メッセージ削除',
  tags: ['messages'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'メッセージID',
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
      description: 'メッセージが見つかりません',
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

// RichMenu エンドポイント
registry.registerPath({
  method: 'get',
  path: '/api/v1/richmenus',
  description: 'リッチメニュー一覧を取得',
  summary: 'リッチメニュー一覧取得',
  tags: ['rich-menus'],
  responses: {
    200: {
      description: 'リッチメニュー一覧',
      content: {
        'application/json': {
          schema: RichMenuListResponse
        }
      }
    }
  }
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/richmenus',
  description: 'リッチメニューを作成',
  summary: 'リッチメニュー作成',
  tags: ['rich-menus'],
  requestBody: {
    content: {
      'application/json': {
        schema: CreateRichMenuRequest
      }
    }
  },
  responses: {
    201: {
      description: '作成されたリッチメニュー',
      content: {
        'application/json': {
          schema: RichMenuResponse
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
  path: '/api/v1/richmenus/{id}',
  description: 'リッチメニュー詳細を取得',
  summary: 'リッチメニュー詳細取得',
  tags: ['rich-menus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'リッチメニューID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: 'リッチメニュー詳細',
      content: {
        'application/json': {
          schema: RichMenuResponse
        }
      }
    },
    404: {
      description: 'リッチメニューが見つかりません',
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
  path: '/api/v1/richmenus/{id}',
  description: 'リッチメニューを更新',
  summary: 'リッチメニュー更新',
  tags: ['rich-menus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'リッチメニューID',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: UpdateRichMenuRequest
      }
    }
  },
  responses: {
    200: {
      description: '更新されたリッチメニュー',
      content: {
        'application/json': {
          schema: RichMenuResponse
        }
      }
    },
    404: {
      description: 'リッチメニューが見つかりません',
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
  path: '/api/v1/richmenus/{id}',
  description: 'リッチメニューを削除',
  summary: 'リッチメニュー削除',
  tags: ['rich-menus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'リッチメニューID',
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
      description: 'リッチメニューが見つかりません',
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
      name: 'messages',
      description: 'メッセージ配信管理API'
    },
    {
      name: 'fans',
      description: 'ファン管理API'
    },
    {
      name: 'auto-reply-rules',
      description: '自動返信ルール管理API'
    },
    {
      name: 'rich-menus',
      description: 'リッチメニュー管理API'
    }
  ]
})

// OpenAPI 仕様をファイルに出力
const outputPath = join(process.cwd(), 'openapi.yaml')
writeFileSync(outputPath, JSON.stringify(document, null, 2))

console.log(`✅ OpenAPI specification generated: ${outputPath}`)