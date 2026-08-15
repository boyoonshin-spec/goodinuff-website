"use client";

import { useState } from "react";
import VoiceField from "@/components/VoiceField";
import type { ScheduleItemDTO } from "@/types/schedule";
import { toDateInputValue } from "@/lib/date";

const REMIND_OPTIONS = [5, 10, 30, 60];

type Props = {
  defaultDate: string;
  defaultIsTodo?: boolean;
  initial?: ScheduleItemDTO;
  kakaoConnected: boolean;
  onSaved: (item: ScheduleItemDTO) => void;
  onCancel?: () => void;
};

export default function ScheduleItemForm({
  defaultDate,
  defaultIsTodo = true,
  initial,
  kakaoConnected,
  onSaved,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [showMemo, setShowMemo] = useState(Boolean(initial?.memo));
  const [date, setDate] = useState(
    initial ? toDateInputValue(new Date(initial.date)) : defaultDate
  );
  const [time, setTime] = useState(initial?.time ?? "");
  const [isTodo, setIsTodo] = useState(initial?.isTodo ?? defaultIsTodo);
  const [remindKakao, setRemindKakao] = useState(initial?.remindKakao ?? false);
  const [remindMinutesBefore, setRemindMinutesBefore] = useState(
    initial?.remindMinutesBefore ?? 10
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      memo: memo.trim() || null,
      date,
      time: time || null,
      isTodo,
      remindKakao: remindKakao && Boolean(time),
      remindMinutesBefore,
    };

    const res = await fetch(initial ? `/api/schedule/${initial.id}` : "/api/schedule", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장에 실패했습니다.");
      return;
    }

    const saved = await res.json();
    onSaved(saved);
    if (!initial) {
      setTitle("");
      setMemo("");
      setShowMemo(false);
      setTime("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-4">
      <VoiceField
        value={title}
        onChange={setTitle}
        placeholder="무엇을 하실 건가요?"
        ariaLabel="제목"
      />

      {showMemo ? (
        <VoiceField
          value={memo}
          onChange={setMemo}
          placeholder="메모 (선택)"
          multiline
          rows={2}
          ariaLabel="메모"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowMemo(true)}
          className="text-xs font-medium text-[var(--accent)]"
        >
          + 메모 추가
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="field w-auto"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="field w-auto"
        />
        <label className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={isTodo}
            onChange={(e) => setIsTodo(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          할일로 표시
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`flex items-center gap-1.5 text-sm ${
            time ? "text-[var(--muted)]" : "text-[var(--muted)]/50"
          }`}
          title={time ? undefined : "알림을 받으려면 시간을 먼저 지정해주세요"}
        >
          <input
            type="checkbox"
            checked={remindKakao}
            disabled={!time}
            onChange={(e) => setRemindKakao(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          카카오톡 알림
        </label>
        {remindKakao && time && (
          <select
            value={remindMinutesBefore}
            onChange={(e) => setRemindMinutesBefore(Number(e.target.value))}
            className="field w-auto py-1.5"
          >
            {REMIND_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}분 전
              </option>
            ))}
          </select>
        )}
        {remindKakao && time && !kakaoConnected && (
          <span className="text-xs text-[var(--danger)]">
            설정에서 카카오 연동을 먼저 완료해주세요
          </span>
        )}
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "저장 중..." : initial ? "수정 완료" : "추가하기"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            취소
          </button>
        )}
      </div>
    </form>
  );
}
