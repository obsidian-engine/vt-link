'use client';

import { useEffect, useRef, useState } from 'react';
import { RichMenuArea, RichMenuSize, RICH_MENU_SIZES } from './types';

interface RichMenuPreviewProps {
  size: 'full' | 'half';
  areas: RichMenuArea[];
  className?: string;
}

export function RichMenuPreview({ size, areas, className = '' }: RichMenuPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const menuSize = RICH_MENU_SIZES[size];
  const previewScale = 0.25; // プレビュー表示用のスケール

  useEffect(() => {
    generatePreview();
  }, [size, areas]);

  const generatePreview = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // キャンバスサイズを設定
      canvas.width = menuSize.width;
      canvas.height = menuSize.height;

      // 背景を描画
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, menuSize.width, menuSize.height);

      // グリッドを描画
      drawGrid(ctx, menuSize);

      // エリアを描画
      areas.forEach((area, index) => {
        drawArea(ctx, area, index);
      });

      // プレビュー画像を生成
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.8);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('プレビュー生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, size: RichMenuSize) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    const gridSize = 100;

    // 縦線
    for (let x = 0; x <= size.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.height);
      ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= size.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const drawArea = (ctx: CanvasRenderingContext2D, area: RichMenuArea, index: number) => {
    const { x, y, width, height, action } = area;

    // エリアの背景色を決定
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
    ];
    const color = colors[index % colors.length];

    // エリアを塗りつぶし
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, y, width, height);

    // エリアの枠線
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;
    ctx.strokeRect(x, y, width, height);

    // アクションアイコンとテキストを描画
    drawActionContent(ctx, area, color);
  };

  const drawActionContent = (ctx: CanvasRenderingContext2D, area: RichMenuArea, color: string) => {
    const { x, y, width, height, action } = area;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // アイコンを描画
    const icon = getActionIcon(action.type);
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(icon, centerX, centerY - 40);

    // テキストを描画
    const text = getActionText(action);
    if (text) {
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(text, centerX, centerY + 40);
    }

    // アクションタイプを描画
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(action.type.toUpperCase(), centerX, centerY + 80);
  };

  const getActionIcon = (type: string): string => {
    switch (type) {
      case 'postback': return '📋';
      case 'message': return '💬';
      case 'uri': return '🔗';
      default: return '❓';
    }
  };

  const getActionText = (action: RichMenuArea['action']): string => {
    switch (action.type) {
      case 'message':
        return action.text?.substring(0, 10) + (action.text && action.text.length > 10 ? '...' : '') || '';
      case 'uri':
        return action.uri ? new URL(action.uri).hostname : '';
      case 'postback':
        return action.displayText?.substring(0, 10) + (action.displayText && action.displayText.length > 10 ? '...' : '') || '';
      default:
        return '';
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          プレビュー
        </h3>
        {isGenerating && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            生成中...
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="リッチメニュープレビュー"
            className="border border-gray-300 dark:border-gray-600 rounded"
            style={{
              width: `${menuSize.width * previewScale}px`,
              height: `${menuSize.height * previewScale}px`,
            }}
          />
        ) : (
          <div 
            className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
            style={{
              width: `${menuSize.width * previewScale}px`,
              height: `${menuSize.height * previewScale}px`,
            }}
          >
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm">プレビューを生成中...</div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {size === 'full' ? 'フルサイズ' : 'ハーフサイズ'} 
            ({menuSize.width}×{menuSize.height}px)
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            エリア数: {areas.length}
          </div>
        </div>
      </div>
    </div>
  );
}