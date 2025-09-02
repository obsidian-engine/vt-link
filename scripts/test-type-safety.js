#!/usr/bin/env node

/**
 * 型安全性テストスクリプト
 * Brand型、IDFactory、Server Actionsの型安全性を検証
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = join(__dirname, '../__tests__/type-safety');

async function runTypeSafetyTests() {
  console.log('🔍 型安全性テストを実行中...');

  try {
    // テストディレクトリが存在しない場合は作成
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Brand型テスト
    await createBrandTypeTest();
    
    // IDFactoryテスト
    await createIdFactoryTest();
    
    // Server Actionsテスト
    await createServerActionsTest();
    
    // API契約テスト
    await createApiContractTest();

    // 全テストを実行
    console.log('▶️  テストを実行中...');
    execSync('npm run test __tests__/type-safety', { 
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });

    console.log('✅ 全ての型安全性テストが完了しました');

  } catch (error) {
    console.error('❌ 型安全性テストに失敗しました:', error.message);
    process.exit(1);
  }
}

async function createBrandTypeTest() {
  const testContent = `/**
 * Brand型の安全性テスト
 */
import { describe, test, expect, expectTypeOf } from 'vitest';
import { IDFactory } from '@/domain/valueObjects/IDFactory';
import type { UserID, AccountID, LineUserID } from '@/domain/valueObjects/BaseTypes';

describe('Brand Type Safety', () => {
  test('should prevent direct assignment between different ID types', () => {
    const userId = IDFactory.generateUserID();
    const accountId = IDFactory.generateAccountID();
    
    // これらの行はTypeScriptエラーになるべき（実際のテストでは型レベルでのチェック）
    // @ts-expect-error - Different brand types should not be assignable
    const wrongAssignment1: UserID = accountId;
    
    // @ts-expect-error - Different brand types should not be assignable  
    const wrongAssignment2: AccountID = userId;
    
    expect(userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(accountId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('should allow creation of valid IDs', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const userId = IDFactory.createUserID(validUuid);
    
    expectTypeOf(userId).toEqualTypeOf<UserID>();
    expect(userId).toBe(validUuid);
  });

  test('should throw on invalid ID creation', () => {
    expect(() => IDFactory.createUserID('invalid-uuid')).toThrow();
    expect(() => IDFactory.createLineUserID('')).toThrow();
    expect(() => IDFactory.createLineChannelID('abc')).toThrow();
  });

  test('should validate LINE User ID format', () => {
    const validLineUserId = 'U1234567890abcdef1234567890abcdef';
    const lineUserId = IDFactory.createLineUserID(validLineUserId);
    
    expectTypeOf(lineUserId).toEqualTypeOf<LineUserID>();
    expect(lineUserId).toBe(validLineUserId);
  });
});`;

  await fs.writeFile(join(TEST_DIR, 'brand-types.test.ts'), testContent);
}

async function createIdFactoryTest() {
  const testContent = `/**
 * IDFactory機能テスト
 */
import { describe, test, expect } from 'vitest';
import { IDFactory, TypeGuards } from '@/domain/valueObjects/IDFactory';

describe('IDFactory', () => {
  test('should generate valid UUIDs', () => {
    const userId = IDFactory.generateUserID();
    const accountId = IDFactory.generateAccountID();
    
    expect(TypeGuards.isUserID(userId)).toBe(true);
    expect(TypeGuards.isAccountID(accountId)).toBe(true);
    expect(userId).not.toBe(accountId);
  });

  test('should validate LINE IDs correctly', () => {
    const validChannelId = '1234567890';
    const invalidChannelId = '12345abc';
    
    expect(TypeGuards.isLineChannelID(validChannelId)).toBe(true);
    expect(TypeGuards.isLineChannelID(invalidChannelId)).toBe(false);
  });

  test('should validate email addresses', () => {
    const validEmail = 'user@example.com';
    const invalidEmail = 'not-an-email';
    
    expect(TypeGuards.isEmailAddress(validEmail)).toBe(true);
    expect(TypeGuards.isEmailAddress(invalidEmail)).toBe(false);
  });

  test('should validate URLs', () => {
    const validUrl = 'https://example.com/path';
    const invalidUrl = 'not-a-url';
    
    expect(TypeGuards.isURL(validUrl)).toBe(true);
    expect(TypeGuards.isURL(invalidUrl)).toBe(false);
  });
});`;

  await fs.writeFile(join(TEST_DIR, 'id-factory.test.ts'), testContent);
}

async function createServerActionsTest() {
  const testContent = `/**
 * Server Actions型安全性テスト
 */
import { describe, test, expect } from 'vitest';
import { ActionExecutor, FormDataParser } from '@/shared/actions/types';
import { z } from 'zod';

describe('Server Actions Type Safety', () => {
  test('should handle successful action execution', async () => {
    const testAction = async () => ({ result: 'success', data: 42 });
    
    const result = await ActionExecutor.execute(testAction);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 'success', data: 42 });
    expect(result.error).toBeUndefined();
    expect(result.timestamp).toBeDefined();
  });

  test('should handle action errors properly', async () => {
    const testAction = async () => {
      throw new Error('Test error');
    };
    
    const result = await ActionExecutor.execute(testAction);
    
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBe('Test error');
  });

  test('should handle Zod validation errors', async () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });
    
    const testAction = async () => {
      schema.parse({ name: '', age: -1 });
      return 'should not reach here';
    };
    
    const result = await ActionExecutor.execute(testAction);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.validationErrors).toBeDefined();
    expect(result.validationErrors?.length).toBeGreaterThan(0);
  });

  test('should parse FormData correctly', () => {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('age', '30');
    formData.append('active', 'true');
    formData.append('tags', 'tag1');
    formData.append('tags', 'tag2');
    
    const parser = new FormDataParser(formData);
    
    expect(parser.getString('name')).toBe('Test User');
    expect(parser.getNumber('age')).toBe(30);
    expect(parser.getBoolean('active')).toBe(true);
    expect(parser.getArray('tags')).toEqual(['tag1', 'tag2']);
  });
});`;

  await fs.writeFile(join(TEST_DIR, 'server-actions.test.ts'), testContent);
}

async function createApiContractTest() {
  const testContent = `/**
 * API契約テスト
 */
import { describe, test, expect } from 'vitest';
import { createApiResponse, createPaginatedResponse, isApiResponse } from '@/shared/types/api';

describe('API Contracts', () => {
  test('should create valid API responses', () => {
    const successResponse = createApiResponse(true, { id: '123', name: 'Test' });
    
    expect(isApiResponse(successResponse)).toBe(true);
    expect(successResponse.success).toBe(true);
    expect(successResponse.data).toEqual({ id: '123', name: 'Test' });
    expect(successResponse.timestamp).toBeDefined();
  });

  test('should create error responses', () => {
    const errorResponse = createApiResponse(false, undefined, 'Something went wrong');
    
    expect(isApiResponse(errorResponse)).toBe(true);
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('Something went wrong');
    expect(errorResponse.data).toBeUndefined();
  });

  test('should create paginated responses', () => {
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const paginatedResponse = createPaginatedResponse(items, 10, 1, 5);
    
    expect(paginatedResponse.items).toEqual(items);
    expect(paginatedResponse.total).toBe(10);
    expect(paginatedResponse.page).toBe(1);
    expect(paginatedResponse.pageSize).toBe(5);
    expect(paginatedResponse.hasNext).toBe(true);
    expect(paginatedResponse.hasPrev).toBe(false);
  });

  test('should validate type guards', () => {
    const validResponse = { success: true, data: {}, timestamp: new Date().toISOString() };
    const invalidResponse = { success: 'true' }; // success should be boolean
    
    expect(isApiResponse(validResponse)).toBe(true);
    expect(isApiResponse(invalidResponse)).toBe(false);
    expect(isApiResponse(null)).toBe(false);
    expect(isApiResponse(undefined)).toBe(false);
  });
});`;

  await fs.writeFile(join(TEST_DIR, 'api-contracts.test.ts'), testContent);
}

// スクリプト直接実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  runTypeSafetyTests().catch(console.error);
}