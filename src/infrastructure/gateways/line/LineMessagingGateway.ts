import { BroadcastPort } from '@/application/message/SendBroadcastMessageUsecase';
import { MessageContent } from '@/domain/entities/MessageCampaign';
import { NarrowcastPort } from '@/application/campaign/SendNowUsecase';
import { MessageContent as CampaignMessageContent } from '@/domain/valueObjects/MessageContent';

export interface LineRichMenuCreateRequest {
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    action: {
      type: string;
      text?: string;
      uri?: string;
      data?: string;
      displayText?: string;
    };
  }>;
}

export interface LineMessage {
  type: string;
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  packageId?: string;
  stickerId?: string;
}

export class LineMessagingGateway implements BroadcastPort, NarrowcastPort {
  readonly #baseUrl = 'https://api.line.me/v2/bot';
  readonly #channelAccessToken: string;

  constructor(channelAccessToken: string) {
    if (!channelAccessToken) {
      throw new Error('LINE channel access token is required');
    }
    this.#channelAccessToken = channelAccessToken;
  }

  async sendBroadcast(content: ReadonlyArray<MessageContent>): Promise<{ sentCount: number }> {
    const messages = this.convertToLineMessages(content);
    
    const response = await fetch(`${this.#baseUrl}/message/broadcast`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }

    return { sentCount: 0 };
  }

  async sendNarrowcast(content: ReadonlyArray<CampaignMessageContent>, userIds: ReadonlyArray<string>): Promise<{ sentCount: number }> {
    const messages = this.convertCampaignToLineMessages(content);
    
    // LINE APIは最大500件のユーザーIDまで一度に送信可能
    const BATCH_SIZE = 500;
    let totalSent = 0;
    
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      
      const response = await fetch(`${this.#baseUrl}/message/narrowcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.#channelAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          recipient: {
            type: 'user',
            userIds: batch,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LINE API error: ${response.status} ${errorText}`);
      }
      
      totalSent += batch.length;
    }

    return { sentCount: totalSent };
  }

  async createRichMenu(request: LineRichMenuCreateRequest): Promise<{ richMenuId: string }> {
    const response = await fetch(`${this.#baseUrl}/richmenu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return { richMenuId: result.richMenuId };
  }

  async uploadRichMenuImage(richMenuId: string, imageBuffer: Buffer): Promise<void> {
    const response = await fetch(`${this.#baseUrl}/richmenu/${richMenuId}/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
        'Content-Type': 'image/png',
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }
  }

  async setDefaultRichMenu(richMenuId: string): Promise<void> {
    const response = await fetch(`${this.#baseUrl}/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }
  }

  private convertToLineMessages(content: ReadonlyArray<MessageContent>): LineMessage[] {
    return content.map(item => {
      switch (item.type) {
        case 'text':
          if (!item.text) {
            throw new Error('Text content is required for text message');
          }
          return {
            type: 'text',
            text: item.text,
          };
        case 'image':
          if (!item.imageUrl) {
            throw new Error('Image URL is required for image message');
          }
          return {
            type: 'image',
            originalContentUrl: item.imageUrl,
            previewImageUrl: item.imageUrl,
          };
        case 'sticker':
          if (!item.packageId || !item.stickerId) {
            throw new Error('Package ID and Sticker ID are required for sticker message');
          }
          return {
            type: 'sticker',
            packageId: item.packageId,
            stickerId: item.stickerId,
          };
        default:
          throw new Error(`Unsupported message type: ${item.type}`);
      }
    });
  }

  private convertCampaignToLineMessages(content: ReadonlyArray<CampaignMessageContent>): LineMessage[] {
    return content.map(item => {
      const lineMessage = item.toLineMessageObject();
      return lineMessage;
    });
  }
}