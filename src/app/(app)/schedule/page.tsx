"use client";

import { useEffect, useState } from "react";
import ScheduleItemForm from "@/components/schedule/ScheduleItemForm";
import ScheduleItemRow from "@/components/schedule/ScheduleItemRow";
import type { ScheduleItemDTO } from "@/types/schedule";
import { addDaysInputValue, formatDateLabel, isToday, todayInputValue } from "@/lib/date";

export default function SchedulePage() {
  const [date, setDate] = useState(todayInputValue());
  const [items, setItems] = useState<ScheduleItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [kakaoConnected, setKakaoConnected] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/schedule?date=${date}`)
      .then((res) => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    fetch("/api/kakao/status")
      .then((res) => res.json())
      .then((data) => setKakaoConnected(Boolean(data.connected)));
  }, []);

  function handleSaved(item: ScheduleItemDTO) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
      return next.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">일정 관리</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          하루의 일정과 할일을 함께 계획해보세요.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setDate((d) => addDaysInputValue(d, -1))}
          className="btn-ghost px-2"
          aria-label="이전 날"
        >
          ←
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="text-sm font-medium">
            {formatDateLabel(date)}
            {isToday(date) && (
              <span className="ml-1.5 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                오늘
              </span>
            )}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field w-auto py-1 text-xs"
          />
        </div>
        <button
          onClick={() => setDate((d) => addDaysInputValue(d, 1))}
          className="btn-ghost px-2"
          aria-label="다음 날"
        >
          →
        </button>
      </div>

      <ScheduleItemForm
        defaultDate={date}
        kakaoConnected={kakaoConnected}
        onSaved={handleSaved}
      />

      <div className="space-y-2">
        {loading ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            이 날의 일정이 아직 없어요.
          </p>
        ) : (
          items.map((item) => (
            <ScheduleItemRow
              key={item.id}
              item={item}
              kakaoConnected={kakaoConnected}
              onChanged={handleSaved}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
