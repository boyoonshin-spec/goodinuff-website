"use client";

import { useEffect, useState } from "react";
import VoiceField from "@/components/VoiceField";
import type { DiaryEntryDTO } from "@/types/diary";
import { addDaysInputValue, formatDateLabel, isToday, todayInputValue } from "@/lib/date";

const MOODS = ["😊", "🙂", "😐", "😢", "😡", "😴"];

export default function DiaryPage() {
  const [date, setDate] = useState(todayInputValue());
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [recent, setRecent] = useState<DiaryEntryDTO[]>([]);

  useEffect(() => {
    setLoading(true);
    setSavedAt(null);
    fetch(`/api/diary?date=${date}`)
      .then((res) => res.json())
      .then((entry: DiaryEntryDTO | null) => {
        setContent(entry?.content ?? "");
        setMood(entry?.mood ?? null);
      })
      .finally(() => setLoading(false));
  }, [date]);

  function loadRecent() {
    fetch("/api/diary")
      .then((res) => res.json())
      .then(setRecent);
  }

  useEffect(() => {
    loadRecent();
  }, []);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, content, mood }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedAt(Date.now());
      loadRecent();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">일기</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          타자로 적거나, 마이크 버튼을 눌러 말로 기록해보세요.
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
            max={todayInputValue()}
            onChange={(e) => setDate(e.target.value)}
            className="field w-auto py-1 text-xs"
          />
        </div>
        <button
          onClick={() => setDate((d) => addDaysInputValue(d, 1))}
          disabled={isToday(date)}
          className="btn-ghost px-2"
          aria-label="다음 날"
        >
          →
        </button>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood((cur) => (cur === m ? null : m))}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors ${
                mood === m ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--accent-soft)]/60"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">불러오는 중...</p>
        ) : (
          <VoiceField
            value={content}
            onChange={setContent}
            placeholder="오늘 하루는 어땠나요?"
            multiline
            rows={8}
            ariaLabel="일기 내용"
          />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="btn-primary"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
          {savedAt && <span className="text-xs text-[var(--muted)]">저장되었어요</span>}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            지난 기록
          </h2>
          <div className="space-y-2">
            {recent
              .filter((e) => e.date.slice(0, 10) !== date)
              .slice(0, 10)
              .map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setDate(entry.date.slice(0, 10))}
                  className="card block w-full p-3.5 text-left transition-colors hover:border-[var(--accent)]"
                >
                  <div className="flex items-center gap-2">
                    {entry.mood && <span>{entry.mood}</span>}
                    <span className="text-xs font-medium text-[var(--muted)]">
                      {formatDateLabel(entry.date.slice(0, 10))}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm">{entry.content}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
