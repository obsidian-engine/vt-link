"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/ui/actions/campaignActions";

export function CreateCampaignForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォームの状態管理
  const [campaignType, setCampaignType] = useState<"broadcast" | "narrowcast">(
    "broadcast",
  );
  const [useTemplate, setUseTemplate] = useState(false);
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [messageType, setMessageType] = useState<"text" | "image" | "sticker">(
    "text",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);

      // 実際のアプリケーションでは認証からaccountIdを取得
      formData.append("accountId", "demo-account-id");

      // コンテンツデータを構築
      const content = [];
      if (messageType === "text") {
        const textContent = formData.get("textContent") as string;
        if (textContent) {
          content.push({
            type: "text",
            payload: { text: textContent },
          });
        }
      } else if (messageType === "image") {
        const imageUrl = formData.get("imageUrl") as string;
        if (imageUrl) {
          content.push({
            type: "image",
            payload: { imageUrl },
          });
        }
      } else if (messageType === "sticker") {
        const packageId = formData.get("packageId") as string;
        const stickerId = formData.get("stickerId") as string;
        if (packageId && stickerId) {
          content.push({
            type: "sticker",
            payload: { packageId, stickerId },
          });
        }
      }

      formData.append("content", JSON.stringify(content));
      formData.append("type", campaignType);

      // スケジュール設定
      if (scheduleType === "scheduled") {
        const scheduledDate = formData.get("scheduledDate") as string;
        const scheduledTime = formData.get("scheduledTime") as string;
        if (scheduledDate && scheduledTime) {
          const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
          formData.append("scheduledAt", scheduledAt.toISOString());
        }
      }

      const result = await createCampaign(formData);

      if (result.success) {
        router.push("/dashboard/campaigns");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}

      {/* キャンペーン基本情報 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          キャンペーン基本情報
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              キャンペーン名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="例: 新商品お知らせキャンペーン"
            />
          </div>
        </div>
      </div>

      {/* 配信設定 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          配信設定
        </h2>
        <div className="space-y-6">
          {/* 配信タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              配信タイプ <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="campaignType"
                  value="broadcast"
                  checked={campaignType === "broadcast"}
                  onChange={(e) =>
                    setCampaignType(e.target.value as "broadcast")
                  }
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  📢 全ユーザー配信（ブロードキャスト）
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="campaignType"
                  value="narrowcast"
                  checked={campaignType === "narrowcast"}
                  onChange={(e) =>
                    setCampaignType(e.target.value as "narrowcast")
                  }
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  🎯 セグメント配信（ナローキャスト）
                </span>
              </label>
            </div>
          </div>

          {/* セグメント選択（ナローキャストの場合のみ） */}
          {campaignType === "narrowcast" && (
            <div>
              <label
                htmlFor="segmentId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                配信先セグメント <span className="text-red-500">*</span>
              </label>
              <select
                name="segmentId"
                id="segmentId"
                required={campaignType === "narrowcast"}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">セグメントを選択してください</option>
                {/* 実際のアプリケーションではセグメント一覧をAPIから取得 */}
                <option value="segment-1">20代女性</option>
                <option value="segment-2">関東エリア</option>
                <option value="segment-3">VIPユーザー</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                事前に作成したセグメントを選択してください
              </p>
            </div>
          )}

          {/* スケジュール設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              配信タイミング <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="now"
                  checked={scheduleType === "now"}
                  onChange={(e) => setScheduleType(e.target.value as "now")}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  即座に配信
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleType === "scheduled"}
                  onChange={(e) =>
                    setScheduleType(e.target.value as "scheduled")
                  }
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  日時指定配信
                </span>
              </label>
            </div>

            {scheduleType === "scheduled" && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="scheduledDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    配信日
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    id="scheduledDate"
                    required={scheduleType === "scheduled"}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="scheduledTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    配信時刻
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    id="scheduledTime"
                    required={scheduleType === "scheduled"}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メッセージ内容 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          メッセージ内容
        </h2>
        <div className="space-y-6">
          {/* テンプレート利用設定 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useTemplate}
                onChange={(e) => setUseTemplate(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                保存済みテンプレートを使用
              </span>
            </label>
          </div>

          {useTemplate ? (
            <div>
              <label
                htmlFor="templateId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                テンプレート選択 <span className="text-red-500">*</span>
              </label>
              <select
                name="templateId"
                id="templateId"
                required={useTemplate}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">テンプレートを選択してください</option>
                {/* 実際のアプリケーションではテンプレート一覧をAPIから取得 */}
                <option value="template-1">お知らせテンプレート</option>
                <option value="template-2">キャンペーン告知</option>
                <option value="template-3">サンキューメッセージ</option>
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              {/* メッセージタイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  メッセージタイプ <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="messageType"
                      value="text"
                      checked={messageType === "text"}
                      onChange={(e) => setMessageType(e.target.value as "text")}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      💬 テキスト
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="messageType"
                      value="image"
                      checked={messageType === "image"}
                      onChange={(e) =>
                        setMessageType(e.target.value as "image")
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      🖼️ 画像
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="messageType"
                      value="sticker"
                      checked={messageType === "sticker"}
                      onChange={(e) =>
                        setMessageType(e.target.value as "sticker")
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      😊 スタンプ
                    </span>
                  </label>
                </div>
              </div>

              {/* メッセージ内容入力 */}
              {messageType === "text" && (
                <div>
                  <label
                    htmlFor="textContent"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    メッセージ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="textContent"
                    id="textContent"
                    rows={4}
                    required={messageType === "text" && !useTemplate}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="配信するメッセージを入力してください&#10;&#10;例:&#10;こんにちは！&#10;新商品のお知らせです✨"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    最大5000文字まで入力可能です
                  </p>
                </div>
              )}

              {messageType === "image" && (
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    画像URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    required={messageType === "image" && !useTemplate}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    JPEG、PNG形式のみ対応。最大ファイルサイズ10MB
                  </p>
                </div>
              )}

              {messageType === "sticker" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="packageId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      パッケージID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="packageId"
                      id="packageId"
                      required={messageType === "sticker" && !useTemplate}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="446"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="stickerId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      スタンプID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="stickerId"
                      id="stickerId"
                      required={messageType === "sticker" && !useTemplate}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="1988"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              作成中...
            </>
          ) : (
            "キャンペーンを作成"
          )}
        </button>
      </div>
    </form>
  );
}

// Next.js Link コンポーネントをインポート
import Link from "next/link";
