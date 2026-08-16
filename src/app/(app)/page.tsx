"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ScheduleItemRow from "@/components/schedule/ScheduleItemRow";
import type { ScheduleItemDTO } from "@/types/schedule";
import type { DiaryEntryDTO } from "@/types/diary";
import { formatDateLabel, todayInputValue } from "@/lib/date";

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = todayInputValue();

  const [items, setItems] = useState<ScheduleItemDTO[]>([]);
  const [diary, setDiary] = useState<DiaryEntryDTO | null>(null);
  const [kakaoConnected, setKakaoConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/schedule?date=${today}`).then((res) => res.json()),
      fetch(`/api/diary?date=${today}`).then((res) => res.json()),
      fetch("/api/kakao/status").then((res) => res.json()),
    ])
      .then(([scheduleData, diaryData, kakaoData]) => {
        setItems(scheduleData);
        setDiary(diaryData);
        setKakaoConnected(Boolean(kakaoData.connected));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChanged(item: ScheduleItemDTO) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const todoItems = items.filter((i) => i.isTodo);
  const doneCount = todoItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Image
          src="/avatar.png"
          alt=""
          width={56}
          height={56}
          className="shrink-0 rounded-full border-2 border-[var(--surface)] shadow-sm"
        />
        <div>
          <h1 className="font-heading text-2xl font-bold">
            안녕하세요{session?.user?.name ? `, ${session.user.name}님` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatDateLabel(today)}</p>
        </div>
      </div>

      {!kakaoConnected && (
        <div className="card flex items-center justify-between gap-3 p-4 text-sm">
          <span className="text-[var(--muted)]">
            카카오톡으로 일정 알림을 받으려면 연동이 필요해요.
          </span>
          <Link href="/settings" className="btn-secondary shrink-0">
            연동하기
          </Link>
        </div>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">오늘의 일정 · 할일</h2>
          {todoItems.length > 0 && (
            <span className="text-xs text-[var(--muted)]">
              {doneCount}/{todoItems.length} 완료
            </span>
          )}
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">불러오는 중...</p>
        ) : items.length === 0 ? (
          <div className="card p-6 text-center text-sm text-[var(--muted)]">
            오늘 등록된 일정이 없어요.
            <div className="mt-3">
              <Link href="/schedule" className="btn-primary">
                일정 추가하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <ScheduleItemRow
                key={item.id}
                item={item}
                kakaoConnected={kakaoConnected}
                onChanged={handleChanged}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">오늘의 일기</h2>
        <Link
          href="/diary"
          className="card block p-4 text-sm transition-colors hover:border-[var(--accent)]"
        >
          {diary ? (
            <p className="line-clamp-3 text-[var(--foreground)]">
              {diary.mood && <span className="mr-1">{diary.mood}</span>}
              {diary.content}
            </p>
          ) : (
            <span className="text-[var(--muted)]">오늘 하루를 기록해보세요 →</span>
          )}
        </Link>
      </section>
    </div>
  );
}
