import { LineReplyService } from '@/domain/services/LineReplyService';
import { Response } from '@/domain/entities/Response';

export class LineReplyServiceImpl implements LineReplyService {
  readonly #baseUrl = 'https://api.line.me/v2/bot';
  readonly #channelAccessToken: string;

  constructor(channelAccessToken: string) {
    if (!channelAccessToken) {
      throw new Error('LINE channel access token is required');
    }
    this.#channelAccessToken = channelAccessToken;
  }

  async sendReply(replyToken: string, responses: Response[]): Promise<void> {
    const messages = responses.map(response => response.toLineMessageObject());
    
    const response = await fetch(`${this.#baseUrl}/message/reply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replyToken,
        messages: messages.slice(0, 5), // LINE allows max 5 messages per reply
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }
  }

  async pushMessage(to: string, responses: Response[]): Promise<void> {
    const messages = responses.map(response => response.toLineMessageObject());
    
    const response = await fetch(`${this.#baseUrl}/message/push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.#channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        messages: messages.slice(0, 5), // LINE allows max 5 messages per push
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE API error: ${response.status} ${errorText}`);
    }
  }
}