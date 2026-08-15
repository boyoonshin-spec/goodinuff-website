"use client";

import { useEffect, useMemo, useState } from "react";
import ScheduleItemForm from "@/components/schedule/ScheduleItemForm";
import ScheduleItemRow from "@/components/schedule/ScheduleItemRow";
import type { ScheduleItemDTO } from "@/types/schedule";
import { todayInputValue, toDateInputValue } from "@/lib/date";

export default function TodoPage() {
  const [items, setItems] = useState<ScheduleItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [kakaoConnected, setKakaoConnected] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  function reload() {
    setLoading(true);
    fetch("/api/schedule?todoOnly=true")
      .then((res) => res.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    fetch("/api/kakao/status")
      .then((res) => res.json())
      .then((data) => setKakaoConnected(Boolean(data.connected)));
  }, []);

  function handleSaved(item: ScheduleItemDTO) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const groups = useMemo(() => {
    const today = todayInputValue();
    const overdue: ScheduleItemDTO[] = [];
    const todayItems: ScheduleItemDTO[] = [];
    const upcoming: ScheduleItemDTO[] = [];
    const completed: ScheduleItemDTO[] = [];

    for (const item of items) {
      if (item.completed) {
        completed.push(item);
        continue;
      }
      const d = toDateInputValue(new Date(item.date));
      if (d < today) overdue.push(item);
      else if (d === today) todayItems.push(item);
      else upcoming.push(item);
    }

    const byDateTime = (a: ScheduleItemDTO, b: ScheduleItemDTO) =>
      toDateInputValue(new Date(a.date)).localeCompare(toDateInputValue(new Date(b.date))) ||
      (a.time || "").localeCompare(b.time || "");

    overdue.sort(byDateTime);
    upcoming.sort(byDateTime);
    todayItems.sort(byDateTime);
    completed.sort((a, b) => byDateTime(b, a));

    return { overdue, todayItems, upcoming, completed };
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">할일</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          날짜에 관계없이 모아보는 할일 목록이에요.
        </p>
      </div>

      <ScheduleItemForm
        defaultDate={todayInputValue()}
        defaultIsTodo
        kakaoConnected={kakaoConnected}
        onSaved={handleSaved}
      />

      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--muted)]">불러오는 중...</p>
      ) : (
        <div className="space-y-6">
          {groups.overdue.length > 0 && (
            <Section
              title="지난 할일"
              items={groups.overdue}
              kakaoConnected={kakaoConnected}
              onChanged={handleSaved}
              onDeleted={handleDeleted}
              showDate
            />
          )}
          <Section
            title="오늘"
            items={groups.todayItems}
            kakaoConnected={kakaoConnected}
            onChanged={handleSaved}
            onDeleted={handleDeleted}
            emptyText="오늘 할일이 없어요."
          />
          {groups.upcoming.length > 0 && (
            <Section
              title="예정"
              items={groups.upcoming}
              kakaoConnected={kakaoConnected}
              onChanged={handleSaved}
              onDeleted={handleDeleted}
              showDate
            />
          )}

          {groups.completed.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted((s) => !s)}
                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
              >
                완료된 할일 {groups.completed.length}개 {showCompleted ? "숨기기" : "보기"}
              </button>
              {showCompleted && (
                <div className="mt-2 space-y-2">
                  {groups.completed.map((item) => (
                    <ScheduleItemRow
                      key={item.id}
                      item={item}
                      kakaoConnected={kakaoConnected}
                      onChanged={handleSaved}
                      onDeleted={handleDeleted}
                      showDate
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  kakaoConnected,
  onChanged,
  onDeleted,
  showDate,
  emptyText,
}: {
  title: string;
  items: ScheduleItemDTO[];
  kakaoConnected: boolean;
  onChanged: (item: ScheduleItemDTO) => void;
  onDeleted: (id: string) => void;
  showDate?: boolean;
  emptyText?: string;
}) {
  if (items.length === 0 && !emptyText) return null;
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ScheduleItemRow
              key={item.id}
              item={item}
              kakaoConnected={kakaoConnected}
              onChanged={onChanged}
              onDeleted={onDeleted}
              showDate={showDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
