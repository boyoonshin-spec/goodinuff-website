import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, sendMemoToMe } from "@/lib/kakao";

// Called on a schedule (e.g. every 5 minutes) by an external cron trigger.
// Protected with a shared bearer secret since there's no logged-in user driving it.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const candidates = await prisma.scheduleItem.findMany({
    where: {
      remindKakao: true,
      reminderSentAt: null,
      time: { not: null },
    },
    include: { user: { select: { id: true } } },
  });

  let sent = 0;
  let skippedStale = 0;
  let failed = 0;

  for (const item of candidates) {
    const [hours, minutes] = (item.time as string).split(":").map(Number);
    const due = new Date(item.date);
    due.setHours(hours, minutes, 0, 0);
    const triggerAt = new Date(due.getTime() - item.remindMinutesBefore * 60 * 1000);

    if (triggerAt > now) continue;

    if (due < staleCutoff) {
      await prisma.scheduleItem.update({
        where: { id: item.id },
        data: { reminderSentAt: now },
      });
      skippedStale += 1;
      continue;
    }

    try {
      const accessToken = await getValidAccessToken(item.userId);
      if (!accessToken) continue;

      const timeLabel = item.time ?? "";
      await sendMemoToMe(
        accessToken,
        `⏰ ${item.remindMinutesBefore}분 후 일정\n${item.title}${
          timeLabel ? ` (${timeLabel})` : ""
        }`
      );
      await prisma.scheduleItem.update({
        where: { id: item.id },
        data: { reminderSentAt: now },
      });
      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ checked: candidates.length, sent, skippedStale, failed });
}
