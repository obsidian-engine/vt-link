import type { Gender, RegionCode } from '@/types/database.types';

export class LineUser {
  readonly id: string;
  readonly accountId: string;
  readonly lineUserId: string;
  readonly displayName: string | null;
  readonly pictureUrl: string | null;
  readonly statusMessage: string | null;
  readonly language: string | null;
  readonly gender: Gender | null;
  readonly age: number | null;
  readonly region: RegionCode | null;
  readonly isFriend: boolean;
  readonly blockedAt: Date | null;
  readonly createdAt: Date;

  constructor(
    id: string,
    accountId: string,
    lineUserId: string,
    displayName: string | null,
    pictureUrl: string | null,
    statusMessage: string | null,
    language: string | null,
    gender: Gender | null,
    age: number | null,
    region: RegionCode | null,
    isFriend: boolean,
    blockedAt: Date | null,
    createdAt: Date
  ) {
    this.id = id;
    this.accountId = accountId;
    this.lineUserId = lineUserId;
    this.displayName = displayName;
    this.pictureUrl = pictureUrl;
    this.statusMessage = statusMessage;
    this.language = language;
    this.gender = gender;
    this.age = age;
    this.region = region;
    this.isFriend = isFriend;
    this.blockedAt = blockedAt;
    this.createdAt = createdAt;
  }

  static create(
    accountId: string,
    lineUserId: string,
    displayName?: string,
    pictureUrl?: string,
    statusMessage?: string,
    language?: string
  ): LineUser {
    return new LineUser(
      crypto.randomUUID(),
      accountId,
      lineUserId,
      displayName || null,
      pictureUrl || null,
      statusMessage || null,
      language || null,
      null,
      null,
      null,
      true,
      null,
      new Date()
    );
  }

  static reconstruct(
    id: string,
    accountId: string,
    lineUserId: string,
    displayName: string | null,
    pictureUrl: string | null,
    statusMessage: string | null,
    language: string | null,
    gender: Gender | null,
    age: number | null,
    region: RegionCode | null,
    isFriend: boolean,
    blockedAt: Date | null,
    createdAt: Date
  ): LineUser {
    return new LineUser(
      id,
      accountId,
      lineUserId,
      displayName,
      pictureUrl,
      statusMessage,
      language,
      gender,
      age,
      region,
      isFriend,
      blockedAt,
      createdAt
    );
  }

  updateProfile(
    displayName?: string,
    pictureUrl?: string,
    statusMessage?: string,
    language?: string
  ): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      displayName !== undefined ? displayName : this.displayName,
      pictureUrl !== undefined ? pictureUrl : this.pictureUrl,
      statusMessage !== undefined ? statusMessage : this.statusMessage,
      language !== undefined ? language : this.language,
      this.gender,
      this.age,
      this.region,
      this.isFriend,
      this.blockedAt,
      this.createdAt
    );
  }

  updateDemographics(
    gender: Gender | null,
    age: number | null,
    region: RegionCode | null
  ): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      this.displayName,
      this.pictureUrl,
      this.statusMessage,
      this.language,
      gender,
      age,
      region,
      this.isFriend,
      this.blockedAt,
      this.createdAt
    );
  }

  block(): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      this.displayName,
      this.pictureUrl,
      this.statusMessage,
      this.language,
      this.gender,
      this.age,
      this.region,
      false,
      new Date(),
      this.createdAt
    );
  }

  unblock(): LineUser {
    return new LineUser(
      this.id,
      this.accountId,
      this.lineUserId,
      this.displayName,
      this.pictureUrl,
      this.statusMessage,
      this.language,
      this.gender,
      this.age,
      this.region,
      true,
      null,
      this.createdAt
    );
  }

  isActive(): boolean {
    return this.isFriend && !this.blockedAt;
  }
}
