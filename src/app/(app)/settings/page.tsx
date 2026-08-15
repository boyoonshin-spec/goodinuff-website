"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const kakaoParam = searchParams.get("kakao");

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [testSending, setTestSending] = useState(false);

  function loadStatus() {
    setLoading(true);
    fetch("/api/kakao/status")
      .then((res) => res.json())
      .then((data) => setConnected(Boolean(data.connected)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStatus();
    if (kakaoParam === "connected") setMessage("카카오톡 연동이 완료되었습니다.");
    if (kakaoParam === "error") setMessage("카카오톡 연동에 실패했습니다. 다시 시도해주세요.");
  }, [kakaoParam]);

  async function handleDisconnect() {
    if (!confirm("카카오톡 연동을 해제할까요? 예약된 알림이 더 이상 발송되지 않아요.")) return;
    await fetch("/api/kakao/disconnect", { method: "POST" });
    loadStatus();
  }

  async function handleTest() {
    setTestSending(true);
    setMessage("");
    const res = await fetch("/api/kakao/test", { method: "POST" });
    const data = await res.json();
    setTestSending(false);
    setMessage(res.ok ? "테스트 메시지를 보냈어요. 카카오톡을 확인해보세요." : data.error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">설정</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">계정과 알림을 관리해요.</p>
      </div>

      <section className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold">계정</h2>
        <p className="text-sm text-[var(--muted)]">{session?.user?.email}</p>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">카카오톡 알림</h2>
          {!loading && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                connected
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {connected ? "연동됨" : "연동 안 됨"}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--muted)]">
          일정·할일에 알림을 켜두면, 지정한 시간 전에 카카오톡 &apos;나에게 보내기&apos;로
          알려드려요.
        </p>

        {message && <p className="text-sm text-[var(--accent)]">{message}</p>}

        <div className="flex gap-2">
          {connected ? (
            <>
              <button
                onClick={handleTest}
                disabled={testSending}
                className="btn-secondary"
              >
                {testSending ? "전송 중..." : "테스트 메시지 보내기"}
              </button>
              <button onClick={handleDisconnect} className="btn-danger">
                연동 해제
              </button>
            </>
          ) : (
            <a href="/api/kakao/authorize" className="btn-primary">
              카카오톡 연동하기
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
