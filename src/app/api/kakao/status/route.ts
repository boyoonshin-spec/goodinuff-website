import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const account = await prisma.kakaoAccount.findUnique({
    where: { userId: session.user.id },
    select: { connectedAt: true },
  });

  return NextResponse.json({
    connected: Boolean(account),
    connectedAt: account?.connectedAt ?? null,
  });
}
