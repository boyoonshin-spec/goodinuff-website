"use client";

import { useMemo } from "react";
import type { ScheduleItemDTO } from "@/types/schedule";
import { getMonthGridDates, isSameMonth, isToday, toDateInputValue } from "@/lib/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE_PER_DAY = 3;

type Props = {
  month: string;
  items: ScheduleItemDTO[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function MonthCalendar({ month, items, selectedDate, onSelectDate }: Props) {
  const grid = useMemo(() => getMonthGridDates(month), [month]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItemDTO[]>();
    for (const item of items) {
      const key = toDateInputValue(new Date(item.date));
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }
    return map;
  }, [items]);

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--accent-soft)]/40">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? "text-[var(--danger)]" : i === 6 ? "text-[var(--teal)]" : "text-[var(--muted)]"
            }`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const dayItems = itemsByDate.get(date) ?? [];
          const inMonth = isSameMonth(date, month);
          const today = isToday(date);
          const selected = date === selectedDate;
          const dayOfWeek = new Date(date).getDay();
          const visible = dayItems.slice(0, MAX_VISIBLE_PER_DAY);
          const overflowCount = dayItems.length - visible.length;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex min-h-[4.5rem] flex-col items-start gap-0.5 border-b border-r border-[var(--border)] p-1 text-left transition-colors last:border-r-0 ${
                selected ? "bg-[var(--accent-soft)]" : inMonth ? "hover:bg-[var(--accent-soft)]/40" : ""
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                  today
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : !inMonth
                      ? "text-[var(--muted)]/40"
                      : dayOfWeek === 0
                        ? "text-[var(--danger)]"
                        : dayOfWeek === 6
                          ? "text-[var(--teal)]"
                          : "text-[var(--foreground)]"
                }`}
              >
                {Number(date.slice(8, 10))}
              </span>
              <div className="flex w-full flex-col gap-0.5">
                {visible.map((item) => (
                  <span
                    key={item.id}
                    className={`w-full truncate rounded px-1 text-[9px] leading-tight ${
                      item.isTodo && item.completed
                        ? "bg-[var(--border)] text-[var(--muted)] line-through"
                        : "bg-[var(--accent-soft)] text-[var(--accent)]"
                    }`}
                  >
                    {item.title}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className="px-1 text-[9px] text-[var(--muted)]">+{overflowCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
