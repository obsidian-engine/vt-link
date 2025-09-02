'use client';

import type { RichMenuAction, RichMenuArea } from './types';
import type { LineActionType } from './types';

interface RichMenuAreaPanelProps {
  area: RichMenuArea | null;
  onAreaUpdate: (areaId: string, updates: Partial<RichMenuArea>) => void;
  onAreaDelete: (areaId: string) => void;
}

export function RichMenuAreaPanel({ area, onAreaUpdate, onAreaDelete }: RichMenuAreaPanelProps) {
  if (!area) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">エリアを選択</h3>
          <p className="text-sm">
            キャンバス上のエリアをクリックして選択するか、
            <br />
            「エリア追加」ボタンで新しいエリアを作成してください。
          </p>
        </div>
      </div>
    );
  }

  const handleSizeChange = (field: 'width' | 'height', value: number) => {
    onAreaUpdate(area.id, { [field]: Math.max(50, value) });
  };

  const handlePositionChange = (field: 'x' | 'y', value: number) => {
    onAreaUpdate(area.id, { [field]: Math.max(0, value) });
  };

  const handleActionChange = (updates: Partial<RichMenuAction>) => {
    onAreaUpdate(area.id, {
      action: { ...area.action, ...updates },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">エリア設定</h3>
        <button
          type="button"
          onClick={() => onAreaDelete(area.id)}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
        >
          🗑️ 削除
        </button>
      </div>

      {/* 位置・サイズ設定 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">位置・サイズ</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              X座標 (px)
            </label>
            <input
              type="number"
              value={area.x}
              onChange={(e) => handlePositionChange('x', Number.parseInt(e.target.value) || 0)}
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y座標 (px)
            </label>
            <input
              type="number"
              value={area.y}
              onChange={(e) => handlePositionChange('y', Number.parseInt(e.target.value) || 0)}
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              幅 (px)
            </label>
            <input
              type="number"
              value={area.width}
              onChange={(e) => handleSizeChange('width', Number.parseInt(e.target.value) || 50)}
              min="50"
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              高さ (px)
            </label>
            <input
              type="number"
              value={area.height}
              onChange={(e) => handleSizeChange('height', Number.parseInt(e.target.value) || 50)}
              min="50"
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* アクション設定 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">アクション設定</h4>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            アクションタイプ
          </label>
          <select
            value={area.action.type}
            onChange={(e) =>
              handleActionChange({
                type: e.target.value as LineActionType,
                // タイプ変更時は他のフィールドをリセット
                text: undefined,
                data: undefined,
                uri: undefined,
                displayText: undefined,
              })
            }
            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="postback">ポストバック</option>
            <option value="message">メッセージ</option>
            <option value="uri">URL</option>
          </select>
        </div>

        {/* アクションタイプ別フィールド */}
        {area.action.type === 'postback' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                ポストバックデータ
              </label>
              <input
                type="text"
                value={area.action.data || ''}
                onChange={(e) => handleActionChange({ data: e.target.value })}
                placeholder="例：menu_action_1"
                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                表示テキスト
              </label>
              <input
                type="text"
                value={area.action.displayText || ''}
                onChange={(e) => handleActionChange({ displayText: e.target.value })}
                placeholder="例：メニューを開く"
                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {area.action.type === 'message' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              送信メッセージ
            </label>
            <textarea
              value={area.action.text || ''}
              onChange={(e) => handleActionChange({ text: e.target.value })}
              placeholder="例：こんにちは！"
              rows={3}
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {area.action.type === 'uri' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={area.action.uri || ''}
              onChange={(e) => handleActionChange({ uri: e.target.value })}
              placeholder="https://example.com"
              className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* エリア情報表示 */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>エリアID: {area.id.substring(0, 8)}...</div>
          <div>
            位置: ({area.x}, {area.y}) サイズ: {area.width}×{area.height}
          </div>
        </div>
      </div>
    </div>
  );
}
