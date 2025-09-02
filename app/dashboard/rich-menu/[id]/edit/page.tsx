'use client';

import { RichMenuEditor } from '@/ui/components/rich-menu/RichMenuEditor';
import { RichMenuPreview } from '@/ui/components/rich-menu/RichMenuPreview';
import type { RichMenuArea } from '@/ui/components/rich-menu/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EditRichMenuPageProps {
  params: {
    id: string;
  };
}

export default function EditRichMenuPage({ params }: EditRichMenuPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [richMenu, setRichMenu] = useState<any>(null);
  const [name, setName] = useState('');
  const [chatBarText, setChatBarText] = useState('');
  const [menuSize, setMenuSize] = useState<'full' | 'half'>('full');
  const [areas, setAreas] = useState<RichMenuArea[]>([]);

  useEffect(() => {
    loadRichMenu();
  }, [params.id]);

  const loadRichMenu = async () => {
    try {
      setIsLoading(true);
      // TODO: リッチメニュー取得APIを実装
      // const result = await getRichMenuById(params.id);
      // if (!result.success) {
      //   return notFound();
      // }
      //
      // const menu = result.data;
      // setRichMenu(menu);
      // setName(menu.name);
      // setChatBarText(menu.chatBarText || '');
      // setMenuSize(menu.size);
      // setAreas(menu.areas || []);

      // デモデータ
      const demoMenu = {
        id: params.id,
        name: 'サンプルリッチメニュー',
        size: 'full' as const,
        chatBarText: 'メニュー',
        areas: [
          {
            id: 'demo-1',
            x: 100,
            y: 100,
            width: 400,
            height: 200,
            action: {
              type: 'postback' as const,
              data: 'menu_action_1',
              displayText: 'メニュー1',
            },
          },
        ],
      };

      setRichMenu(demoMenu);
      setName(demoMenu.name);
      setChatBarText(demoMenu.chatBarText);
      setMenuSize(demoMenu.size);
      setAreas(demoMenu.areas);
    } catch (error) {
      setError('リッチメニューの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // エリア情報をFormDataに追加
      formData.set('areas', JSON.stringify(areas));
      formData.set('id', params.id);

      // TODO: 更新APIを実装
      // const result = await updateRichMenu(formData);
      //
      // if (!result.success) {
      //   setError(result.error);
      //   return;
      // }

      // 成功時はリッチメニュー一覧にリダイレクト
      window.location.href = '/dashboard/rich-menu';
    } catch (error) {
      setError('予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <div className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!richMenu) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/dashboard/rich-menu"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-4"
            >
              ← リッチメニュー一覧
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎨 リッチメニュー編集
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form action={handleSubmit} className="space-y-8">
            {/* エラー表示 */}
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            )}

            {/* 基本設定セクション */}
            <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    基本設定
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    リッチメニューの基本情報を設定します。
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        メニュー名 *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="例：メインメニュー"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="size"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        サイズ *
                      </label>
                      <select
                        id="size"
                        name="size"
                        value={menuSize}
                        onChange={(e) => setMenuSize(e.target.value as 'full' | 'half')}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="full">フル（2500×1686px）</option>
                        <option value="half">ハーフ（2500×843px）</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="chatBarText"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        チャットバーテキスト
                      </label>
                      <input
                        type="text"
                        name="chatBarText"
                        id="chatBarText"
                        maxLength={14}
                        value={chatBarText}
                        onChange={(e) => setChatBarText(e.target.value)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="例：メニュー"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* エディターセクション */}
            <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    メニューデザイン
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ドラッグ&ドロップでエリアを設定し、アクションを定義します。
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <RichMenuEditor size={menuSize} onAreasChange={setAreas} initialAreas={areas} />
                </div>
              </div>
            </div>

            {/* プレビューセクション */}
            <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    プレビュー
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    実際のLINEでの表示をシミュレートします。
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <RichMenuPreview size={menuSize} areas={areas} />
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/rich-menu"
                className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
