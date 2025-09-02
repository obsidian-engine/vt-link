'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAutoReplyRule } from '@/ui/actions/autoReplyActions';

interface Condition {
  type: 'keyword' | 'regex' | 'messageType' | 'time' | 'user';
  [key: string]: any;
}

interface Response {
  type: 'text' | 'image' | 'sticker';
  [key: string]: any;
}

export default function NewAutoReplyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState(0);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (conditions.length === 0) {
        throw new Error('少なくとも1つの条件が必要です');
      }
      
      if (responses.length === 0) {
        throw new Error('少なくとも1つの返信が必要です');
      }

      const formData = new FormData();
      formData.append('accountId', 'default-account'); // TODO: Get from session
      formData.append('name', name);
      formData.append('conditions', JSON.stringify(conditions));
      formData.append('responses', JSON.stringify(responses));
      formData.append('enabled', enabled.toString());
      formData.append('priority', priority.toString());

      const result = await createAutoReplyRule(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push('/dashboard/auto-reply');
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { type: 'keyword', keyword: '', mode: 'partial', caseSensitive: false }]);
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addResponse = () => {
    setResponses([...responses, { type: 'text', text: '', probability: 1.0 }]);
  };

  const updateResponse = (index: number, updates: Partial<Response>) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], ...updates };
    setResponses(newResponses);
  };

  const removeResponse = (index: number) => {
    setResponses(responses.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/auto-reply"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                ← 自動返信Bot
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                新しいルールを作成
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 基本設定 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              基本設定
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ルール名 *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="例: 挨拶返信"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  優先度
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">数値が大きいほど優先度が高くなります</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  ルールを有効にする
                </label>
              </div>
            </div>
          </div>

          {/* 条件設定 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                反応条件
              </h2>
              <button
                type="button"
                onClick={addCondition}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                条件を追加
              </button>
            </div>
            {conditions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">条件を追加してください</p>
            ) : (
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <ConditionEditor
                    key={index}
                    condition={condition}
                    onChange={(updates) => updateCondition(index, updates)}
                    onRemove={() => removeCondition(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 返信設定 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                自動返信内容
              </h2>
              <button
                type="button"
                onClick={addResponse}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                返信を追加
              </button>
            </div>
            {responses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">返信内容を追加してください</p>
            ) : (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <ResponseEditor
                    key={index}
                    response={response}
                    onChange={(updates) => updateResponse(index, updates)}
                    onRemove={() => removeResponse(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/auto-reply"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '作成中...' : 'ルールを作成'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function ConditionEditor({ condition, onChange, onRemove }: {
  condition: Condition;
  onChange: (updates: Partial<Condition>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <select
          value={condition.type}
          onChange={(e) => onChange({ type: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="keyword">キーワード</option>
          <option value="regex">正規表現</option>
          <option value="messageType">メッセージタイプ</option>
          <option value="time">時間</option>
          <option value="user">ユーザー</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          削除
        </button>
      </div>

      {condition.type === 'keyword' && (
        <div className="space-y-3">
          <input
            type="text"
            value={condition.keyword || ''}
            onChange={(e) => onChange({ keyword: e.target.value })}
            placeholder="キーワードを入力"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="flex space-x-4">
            <select
              value={condition.mode || 'partial'}
              onChange={(e) => onChange({ mode: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="partial">部分一致</option>
              <option value="exact">完全一致</option>
              <option value="startsWith">前方一致</option>
              <option value="endsWith">後方一致</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={condition.caseSensitive || false}
                onChange={(e) => onChange({ caseSensitive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">大文字小文字を区別</span>
            </label>
          </div>
        </div>
      )}

      {condition.type === 'regex' && (
        <input
          type="text"
          value={condition.pattern || ''}
          onChange={(e) => onChange({ pattern: e.target.value })}
          placeholder="正規表現パターン"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      )}
    </div>
  );
}

function ResponseEditor({ response, onChange, onRemove }: {
  response: Response;
  onChange: (updates: Partial<Response>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <select
          value={response.type}
          onChange={(e) => onChange({ type: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="text">テキスト</option>
          <option value="image">画像</option>
          <option value="sticker">スタンプ</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          削除
        </button>
      </div>

      {response.type === 'text' && (
        <textarea
          value={response.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="返信メッセージを入力"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
        />
      )}

      {response.type === 'image' && (
        <div className="space-y-3">
          <input
            type="url"
            value={response.originalContentUrl || ''}
            onChange={(e) => onChange({ originalContentUrl: e.target.value })}
            placeholder="画像URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="url"
            value={response.previewImageUrl || ''}
            onChange={(e) => onChange({ previewImageUrl: e.target.value })}
            placeholder="プレビュー画像URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      {response.type === 'sticker' && (
        <div className="space-y-3">
          <input
            type="text"
            value={response.packageId || ''}
            onChange={(e) => onChange({ packageId: e.target.value })}
            placeholder="パッケージID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={response.stickerId || ''}
            onChange={(e) => onChange({ stickerId: e.target.value })}
            placeholder="スティッカーID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          実行確率: {Math.round((response.probability || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={response.probability || 1}
          onChange={(e) => onChange({ probability: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}