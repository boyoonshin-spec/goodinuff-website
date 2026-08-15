"use client";

import { useState } from "react";
import type { ScheduleItemDTO } from "@/types/schedule";
import ScheduleItemForm from "./ScheduleItemForm";
import { toDateInputValue } from "@/lib/date";

type Props = {
  item: ScheduleItemDTO;
  kakaoConnected: boolean;
  onChanged: (item: ScheduleItemDTO) => void;
  onDeleted: (id: string) => void;
  showDate?: boolean;
};

export default function ScheduleItemRow({
  item,
  kakaoConnected,
  onChanged,
  onDeleted,
  showDate = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleCompleted() {
    setBusy(true);
    const res = await fetch(`/api/schedule/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    setBusy(false);
    if (res.ok) onChanged(await res.json());
  }

  async function handleDelete() {
    if (!confirm("삭제할까요?")) return;
    setBusy(true);
    const res = await fetch(`/api/schedule/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onDeleted(item.id);
  }

  if (editing) {
    return (
      <ScheduleItemForm
        defaultDate={toDateInputValue(new Date(item.date))}
        initial={item}
        kakaoConnected={kakaoConnected}
        onSaved={(saved) => {
          onChanged(saved);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="card flex items-start gap-3 p-3.5">
      {item.isTodo ? (
        <button
          onClick={toggleCompleted}
          disabled={busy}
          aria-label={item.completed ? "완료 취소" : "완료로 표시"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            item.completed
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-[var(--border)]"
          }`}
        >
          {item.completed && (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
              <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
            </svg>
          )}
        </button>
      ) : (
        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`text-sm font-medium ${
              item.completed ? "text-[var(--muted)] line-through" : ""
            }`}
          >
            {item.title}
          </span>
          {item.time && (
            <span className="text-xs text-[var(--muted)]">{item.time}</span>
          )}
          {showDate && (
            <span className="text-xs text-[var(--muted)]">
              {toDateInputValue(new Date(item.date))}
            </span>
          )}
          {item.remindKakao && (
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
              카톡 {item.remindMinutesBefore}분 전
            </span>
          )}
        </div>
        {item.memo && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">{item.memo}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          aria-label="수정"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M13.5 2.5a1.5 1.5 0 0 1 2.12 2.12l-.94.94-2.12-2.12.94-.94ZM11.5 4.5 3 13v2.12L4.88 15 13.5 6.38 11.5 4.5Z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
          aria-label="삭제"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M8 2a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h.5l.7 10.1A2 2 0 0 0 7.2 18h5.6a2 2 0 0 0 2-1.9L15.5 6h.5a1 1 0 1 0 0-2h-3V3a1 1 0 0 0-1-1H8Zm0 5a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm5 1a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V8Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
