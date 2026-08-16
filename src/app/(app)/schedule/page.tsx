"use client";

import { useEffect, useState } from "react";
import ScheduleItemForm from "@/components/schedule/ScheduleItemForm";
import ScheduleItemRow from "@/components/schedule/ScheduleItemRow";
import MonthCalendar from "@/components/schedule/MonthCalendar";
import type { ScheduleItemDTO } from "@/types/schedule";
import {
  addDaysInputValue,
  addMonthsInputValue,
  formatDateLabel,
  formatMonthLabel,
  getMonthGridDates,
  isToday,
  todayInputValue,
} from "@/lib/date";

type View = "day" | "month";

export default function SchedulePage() {
  const [view, setView] = useState<View>("day");
  const [date, setDate] = useState(todayInputValue());
  const [month, setMonth] = useState(todayInputValue().slice(0, 7) + "-01");
  const [items, setItems] = useState<ScheduleItemDTO[]>([]);
  const [monthItems, setMonthItems] = useState<ScheduleItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [kakaoConnected, setKakaoConnected] = useState(false);

  useEffect(() => {
    if (view !== "day") return;
    setLoading(true);
    fetch(`/api/schedule?date=${date}`)
      .then((res) => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, [date, view]);

  useEffect(() => {
    if (view !== "month") return;
    const grid = getMonthGridDates(month);
    const from = grid[0];
    const to = addDaysInputValue(grid[grid.length - 1], 1);
    setLoading(true);
    fetch(`/api/schedule?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then(setMonthItems)
      .finally(() => setLoading(false));
  }, [month, view]);

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
    setMonthItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setMonthItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSelectDate(selected: string) {
    setDate(selected);
    setView("day");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">일정 관리</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            하루의 일정과 할일을 함께 계획해보세요.
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-xl bg-[var(--accent-soft)] p-1">
          <button
            onClick={() => setView("day")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "day" ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)]"
            }`}
          >
            일별
          </button>
          <button
            onClick={() => setView("month")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              view === "month" ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)]"
            }`}
          >
            월별
          </button>
        </div>
      </div>

      {view === "day" ? (
        <>
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
                {isToday(date) && <span className="badge-today ml-1.5">오늘</span>}
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
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setMonth((m) => addMonthsInputValue(m, -1))}
              className="btn-ghost px-2"
              aria-label="이전 달"
            >
              ←
            </button>
            <span className="text-sm font-medium">{formatMonthLabel(month)}</span>
            <button
              onClick={() => setMonth((m) => addMonthsInputValue(m, 1))}
              className="btn-ghost px-2"
              aria-label="다음 달"
            >
              →
            </button>
          </div>

          <MonthCalendar
            month={month}
            items={monthItems}
            selectedDate={date}
            onSelectDate={handleSelectDate}
          />
        </>
      )}
    </div>
  );
}
