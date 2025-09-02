import type { LineUser } from '../entities/LineUser';
import type { TargetSegment } from '../entities/TargetSegment';

export interface TargetSegmentRepository {
  /**
   * セグメントを保存します
   */
  save(segment: TargetSegment): Promise<void>;

  /**
   * IDでセグメントを検索します
   */
  findById(id: string): Promise<TargetSegment | null>;

  /**
   * アカウントIDでセグメントを検索します
   */
  findByAccountId(accountId: string): Promise<TargetSegment[]>;

  /**
   * アカウントIDでアクティブなセグメントを検索します
   */
  findActiveByAccountId(accountId: string): Promise<TargetSegment[]>;

  /**
   * セグメント名での部分一致検索
   */
  findByNamePattern(accountId: string, namePattern: string): Promise<TargetSegment[]>;

  /**
   * セグメントを削除します
   */
  delete(id: string): Promise<void>;

  /**
   * アカウント内のセグメント数を取得します
   */
  countByAccountId(accountId: string): Promise<number>;

  /**
   * アカウント内のアクティブなセグメント数を取得します
   */
  countActiveByAccountId(accountId: string): Promise<number>;

  /**
   * 指定されたセグメントの推定サイズを計算して更新します
   */
  updateEstimatedSize(segmentId: string, users: LineUser[]): Promise<void>;
}
