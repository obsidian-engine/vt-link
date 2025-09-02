"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { RichMenuCanvas } from "./RichMenuCanvas";
import { RichMenuAreaPanel } from "./RichMenuAreaPanel";
import {
  RichMenuArea,
  RICH_MENU_SIZES,
  EDITOR_SCALE,
  GRID_SIZE,
} from "./types";

interface RichMenuEditorProps {
  size: "full" | "half";
  onAreasChange: (areas: RichMenuArea[]) => void;
  initialAreas?: RichMenuArea[];
}

export function RichMenuEditor({
  size,
  onAreasChange,
  initialAreas = [],
}: RichMenuEditorProps) {
  const [areas, setAreas] = useState<RichMenuArea[]>(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  const menuSize = RICH_MENU_SIZES[size];
  const editorSize = {
    width: menuSize.width * EDITOR_SCALE,
    height: menuSize.height * EDITOR_SCALE,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const snapToGridModifier = createSnapModifier(GRID_SIZE * EDITOR_SCALE);

  // 初期エリアが変更されたときに反映
  useEffect(() => {
    setAreas(initialAreas);
    onAreasChange(initialAreas);
  }, [initialAreas, onAreasChange]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveAreaId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const areaId = active.id as string;

      setAreas((prev) => {
        const newAreas = prev.map((area) => {
          if (area.id !== areaId) return area;

          const newX = Math.max(
            0,
            Math.min(
              area.x + delta.x / EDITOR_SCALE,
              menuSize.width - area.width,
            ),
          );
          const newY = Math.max(
            0,
            Math.min(
              area.y + delta.y / EDITOR_SCALE,
              menuSize.height - area.height,
            ),
          );

          return {
            ...area,
            x: Math.round(newX / GRID_SIZE) * GRID_SIZE,
            y: Math.round(newY / GRID_SIZE) * GRID_SIZE,
          };
        });

        onAreasChange(newAreas);
        return newAreas;
      });

      setActiveAreaId(null);
    },
    [menuSize, onAreasChange],
  );

  const handleAreaAdd = useCallback(() => {
    const newArea: RichMenuArea = {
      id: crypto.randomUUID(),
      x: 100,
      y: 100,
      width: 400,
      height: 200,
      action: {
        type: "postback",
        data: "",
        displayText: "",
      },
    };

    setAreas((prev) => {
      const newAreas = [...prev, newArea];
      onAreasChange(newAreas);
      return newAreas;
    });
    setSelectedAreaId(newArea.id);
  }, [onAreasChange]);

  const handleAreaUpdate = useCallback(
    (areaId: string, updates: Partial<RichMenuArea>) => {
      setAreas((prev) => {
        const newAreas = prev.map((area) =>
          area.id === areaId ? { ...area, ...updates } : area,
        );
        onAreasChange(newAreas);
        return newAreas;
      });
    },
    [onAreasChange],
  );

  const handleAreaDelete = useCallback(
    (areaId: string) => {
      setAreas((prev) => {
        const newAreas = prev.filter((area) => area.id !== areaId);
        onAreasChange(newAreas);
        return newAreas;
      });
      if (selectedAreaId === areaId) {
        setSelectedAreaId(null);
      }
    },
    [onAreasChange, selectedAreaId],
  );

  const selectedArea = selectedAreaId
    ? areas.find((area) => area.id === selectedAreaId)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* エディターキャンバス */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              キャンバス ({size === "full" ? "フル" : "ハーフ"})
            </h3>
            <button
              type="button"
              onClick={handleAreaAdd}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ➕ エリア追加
            </button>
          </div>

          <DndContext
            sensors={sensors}
            modifiers={[snapToGridModifier]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <RichMenuCanvas
              size={editorSize}
              areas={areas}
              selectedAreaId={selectedAreaId}
              onAreaSelect={setSelectedAreaId}
            />
            <DragOverlay>
              {activeAreaId ? (
                <div className="bg-blue-500 opacity-50 border-2 border-blue-600 rounded">
                  ドラッグ中...
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* エリア設定パネル */}
      <div className="lg:col-span-1">
        <RichMenuAreaPanel
          area={selectedArea}
          onAreaUpdate={handleAreaUpdate}
          onAreaDelete={handleAreaDelete}
        />
      </div>
    </div>
  );
}
