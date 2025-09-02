import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base JavaScript rules
  js.configs.recommended,
  
  // Global ignore patterns
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'src/generated/',
      '*.js',
      '*.mjs'
    ]
  },
  
  // TypeScript and React configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      
      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      
      // ============================================================================
      // TypeScript厳格化ルール
      // ============================================================================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-readonly-parameter-types': 'warn',
      
      // ============================================================================
      // Next.js / Server Actions 関連ルール
      // ============================================================================
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['next/headers', 'next/cookies'],
            importNames: ['cookies', 'headers'],
            message: 'Use these only in Server Actions or Server Components. Consider moving to a server utility function.'
          }
        ]
      }],
      
      // ============================================================================
      // 基本ルール
      // ============================================================================
      'prefer-const': 'error',
      'no-var': 'error',
      
      // ============================================================================
      // 型安全性強化ルール
      // ============================================================================
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: false
      }],
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      
      // ============================================================================
      // Brand型関連ルール
      // ============================================================================
      '@typescript-eslint/no-type-alias': 'off', // Brand型で必要
      
      // ============================================================================
      // パフォーマンス関連
      // ============================================================================
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      
      // ============================================================================
      // 保守性向上
      // ============================================================================
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true
      }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      
      // React Hooks関連
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // 型エスケープハッチ: 説明付きなら許可
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': false,
        'ts-check': false,
        minimumDescriptionLength: 10
      }],
    },
  },
  
  // Server Actions用の特別ルール
  {
    files: ['**/actions/**/*.ts', '**/app/**/action.ts', '**/app/**/*action*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: false
      }],
      'no-restricted-globals': ['error', 
        {
          name: 'window',
          message: 'Window object is not available in Server Actions'
        },
        {
          name: 'document',
          message: 'Document object is not available in Server Actions'
        },
        {
          name: 'localStorage',
          message: 'localStorage is not available in Server Actions'
        },
        {
          name: 'sessionStorage',
          message: 'sessionStorage is not available in Server Actions'
        }
      ],
    }
  },
  
  // スキーマファイル用の緩和ルール
  {
    files: ['**/validation/**/*.ts', '**/*schema*.ts'],
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }
  },
  
  // 型定義ファイル用の緩和ルール
  {
    files: ['**/*.d.ts', '**/types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    }
  },
  
  // テストファイル用の緩和ルール
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }
  }
];