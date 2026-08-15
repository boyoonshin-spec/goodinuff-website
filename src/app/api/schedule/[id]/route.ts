import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedItem(userId: string, id: string) {
  const item = await prisma.scheduleItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) return null;
  return item;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedItem(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.title === "string") data.title = body.title.trim();
  if (typeof body?.memo === "string" || body?.memo === null) {
    data.memo = body.memo ? body.memo.trim() : null;
  }
  if (typeof body?.date === "string") {
    const date = new Date(body.date);
    if (!Number.isNaN(date.getTime())) data.date = date;
  }
  if (typeof body?.time === "string" || body?.time === null) {
    data.time = body.time || null;
  }
  if (typeof body?.isTodo === "boolean") data.isTodo = body.isTodo;
  if (typeof body?.completed === "boolean") data.completed = body.completed;
  if (typeof body?.remindKakao === "boolean") data.remindKakao = body.remindKakao;
  if (typeof body?.remindMinutesBefore === "number") {
    data.remindMinutesBefore = body.remindMinutesBefore;
  }

  // Re-arm the reminder if the schedule was pushed out again after already firing.
  if (("date" in data || "time" in data || "remindKakao" in data) && existing.reminderSentAt) {
    data.reminderSentAt = null;
  }

  const updated = await prisma.scheduleItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedItem(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.scheduleItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
