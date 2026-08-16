import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { getAuthorizeUrl, isKakaoConfigured } from "@/lib/kakao";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!isKakaoConfigured()) {
    return NextResponse.json(
      { error: "카카오 연동이 아직 설정되지 않았습니다. 관리자에게 문의하세요." },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(getAuthorizeUrl(state));
  res.cookies.set("kakao_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
