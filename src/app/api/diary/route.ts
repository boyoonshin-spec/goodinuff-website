import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfDay(input: string | Date) {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (date) {
    const entry = await prisma.diaryEntry.findUnique({
      where: { userId_date: { userId: session.user.id, date: startOfDay(date) } },
    });
    return NextResponse.json(entry);
  }

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 60,
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content : "";
  const date = startOfDay(body?.date || new Date());
  const mood = typeof body?.mood === "string" ? body.mood : null;

  if (!content.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const entry = await prisma.diaryEntry.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { content, mood },
    create: { userId: session.user.id, date, content, mood },
  });

  return NextResponse.json(entry);
}
