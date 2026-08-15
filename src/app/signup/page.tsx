"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthBackdrop from "@/components/AuthBackdrop";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AuthBackdrop />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold">나의 하루</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">계정을 만들어 시작해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="label" htmlFor="name">
              이름 (선택)
            </label>
            <input
              id="name"
              type="text"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="보윤"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
            />
          </div>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--accent)] font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
