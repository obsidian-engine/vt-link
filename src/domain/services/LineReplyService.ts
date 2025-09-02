import type { LineMessageUnion } from '@/types/line.types';

export interface LineReplyService {
  reply(replyToken: string, messages: LineMessageUnion[]): Promise<void>;
}
