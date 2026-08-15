import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getValidAccessToken, sendMemoToMe } from "@/lib/kakao";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "카카오 계정이 연동되어 있지 않습니다." }, { status: 400 });
  }

  try {
    await sendMemoToMe(accessToken, "🔔 나의 하루 앱과 카카오톡 알림 연동이 완료되었습니다!");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "메시지 전송에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
