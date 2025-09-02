'use client';

import { useDraggable } from '@dnd-kit/core';
import { memo } from 'react';
import type { LineActionType, RichMenuArea, RichMenuSize } from './types';
import { EDITOR_SCALE } from './types';

interface RichMenuCanvasProps {
  size: RichMenuSize;
  areas: RichMenuArea[];
  selectedAreaId: string | null;
  onAreaSelect: (areaId: string | null) => void;
}

export const RichMenuCanvas = memo(function RichMenuCanvas({
  size,
  areas,
  selectedAreaId,
  onAreaSelect,
}: RichMenuCanvasProps) {
  return (
    <div className="relative bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
      <div
        className="relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        {/* グリッド表示 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: `${10 * EDITOR_SCALE}px ${10 * EDITOR_SCALE}px`,
          }}
        />

        {/* 中央説明テキスト */}
        {areas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-lg mb-2">🎨</div>
              <div className="text-sm">「エリア追加」ボタンでメニューエリアを追加</div>
              <div className="text-xs mt-1">ドラッグして位置を調整できます</div>
            </div>
          </div>
        )}

        {/* エリア要素 */}
        {areas.map((area) => (
          <DraggableArea
            key={area.id}
            area={area}
            isSelected={selectedAreaId === area.id}
            onSelect={() => onAreaSelect(area.id)}
          />
        ))}
      </div>
    </div>
  );
});

interface DraggableAreaProps {
  area: RichMenuArea;
  isSelected: boolean;
  onSelect: () => void;
}

function DraggableArea({ area, isSelected, onSelect }: DraggableAreaProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: area.id,
    data: {
      type: 'area',
      area,
    },
  });

  const style = {
    position: 'absolute' as const,
    left: `${area.x * EDITOR_SCALE}px`,
    top: `${area.y * EDITOR_SCALE}px`,
    width: `${area.width * EDITOR_SCALE}px`,
    height: `${area.height * EDITOR_SCALE}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
  };

  const getActionIcon = (type: LineActionType) => {
    switch (type) {
      case LineActionType.Postback:
        return '📋';
      case LineActionType.Message:
        return '💬';
      case LineActionType.Uri:
        return '🔗';
      default:
        return '❓';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        border-2 rounded cursor-move select-none transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
            : 'border-gray-400 bg-white/70 dark:bg-gray-800/70 hover:border-gray-600'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      <div className="h-full flex flex-col items-center justify-center p-2 text-center">
        <div className="text-lg mb-1">{getActionIcon(area.action.type)}</div>
        <div className="text-xs text-gray-700 dark:text-gray-300 leading-tight">
          {area.action.type === 'message' && area.action.text
            ? area.action.text.substring(0, 20) + (area.action.text.length > 20 ? '...' : '')
            : area.action.type === 'uri' && area.action.uri
              ? new URL(area.action.uri).hostname
              : area.action.type === 'postback' && area.action.displayText
                ? area.action.displayText.substring(0, 20)
                : `${area.action.type} エリア`}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(area.width)}×{Math.round(area.height)}
        </div>
      </div>
    </div>
  );
}
