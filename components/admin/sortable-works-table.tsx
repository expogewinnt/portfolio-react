"use client";
/* eslint-disable @next/next/no-img-element */

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

export type SortableWorkRow = {
  id: string;
  title: string;
  charge: string;
  imageSrc: string;
};

type SortableWorksTableProps = {
  works: SortableWorkRow[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  renderActions: (work: SortableWorkRow) => React.ReactNode;
};

function SortableWorkRowItem({
  work,
  index,
  total,
  renderActions,
  disabled
}: {
  work: SortableWorkRow;
  index: number;
  total: number;
  renderActions: (work: SortableWorkRow) => React.ReactNode;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: work.id,
    disabled
  });

  return (
    <div
      ref={setNodeRef}
      className={`adminTableRow${isDragging ? " isDragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <button
        type="button"
        className="adminDragHandle"
        aria-label={`${work.title} をドラッグして並び替え`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        ::
      </button>
      <div className="adminTableNumber">{String(total - index).padStart(3, "0")}</div>
      <div className="adminTableThumb">
        <img src={work.imageSrc} alt={work.title} />
      </div>
      <div className="adminTableBody">
        <p className="adminListTitle">{work.title}</p>
        <p className="adminMuted">{work.charge}</p>
      </div>
      <div className="adminTableMeta">{renderActions(work)}</div>
    </div>
  );
}

export function SortableWorksTable({ works, onReorder, renderActions }: SortableWorksTableProps) {
  const [items, setItems] = useState(works);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [worksKey, setWorksKey] = useState(() => works.map((work) => work.id).join("|"));
  const nextWorksKey = works.map((work) => work.id).join("|");

  if (nextWorksKey !== worksKey) {
    setWorksKey(nextWorksKey);
    setItems(works);
    setError(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (isSaving || !over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setError(null);
    setIsSaving(true);

    void (async () => {
      try {
        await onReorder(next.map((item) => item.id));
      } catch (cause) {
        setItems(previous);
        setError(cause instanceof Error ? cause.message : "並び替えに失敗しました。");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <div className={`adminSortableTable${isSaving ? " isSaving" : ""}`}>
      <p className="adminMuted adminSortHint">
        {isSaving
          ? "並び順を保存しています。完了まで操作を待ってください…"
          : "ドラッグ＆ドロップで表示順を変更できます。"}
      </p>
      {error ? <p className="adminError">{error}</p> : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="adminTable">
            {items.map((work, index) => (
              <SortableWorkRowItem
                key={work.id}
                work={work}
                index={index}
                total={items.length}
                renderActions={renderActions}
                disabled={isSaving}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
