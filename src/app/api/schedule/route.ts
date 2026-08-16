import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const todoOnly = searchParams.get("todoOnly") === "true";

  const where: Record<string, unknown> = { userId: session.user.id };
  if (date) {
    const day = new Date(date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    where.date = { gte: day, lt: nextDay };
  } else if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lt: new Date(to) } : {}),
    };
  }
  if (todoOnly) where.isTodo = true;

  const items = await prisma.scheduleItem.findMany({
    where,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }
  const date = body?.date ? new Date(body.date) : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "날짜가 올바르지 않습니다." }, { status: 400 });
  }

  const item = await prisma.scheduleItem.create({
    data: {
      userId: session.user.id,
      title,
      memo: typeof body?.memo === "string" ? body.memo.trim() || null : null,
      date,
      time: typeof body?.time === "string" && body.time ? body.time : null,
      isTodo: body?.isTodo !== false,
      remindKakao: Boolean(body?.remindKakao),
      remindMinutesBefore:
        typeof body?.remindMinutesBefore === "number" ? body.remindMinutesBefore : 10,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
