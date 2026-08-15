import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exchangeCodeForToken, saveKakaoTokens } from "@/lib/kakao";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const origin = new URL(req.url).origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("kakao_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/settings?kakao=error", origin));
  }

  try {
    const token = await exchangeCodeForToken(code);
    await saveKakaoTokens(session.user.id, token);
  } catch {
    return NextResponse.redirect(new URL("/settings?kakao=error", origin));
  }

  const res = NextResponse.redirect(new URL("/settings?kakao=connected", origin));
  res.cookies.delete("kakao_oauth_state");
  return res;
}
