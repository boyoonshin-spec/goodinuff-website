import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// One-time setup endpoint: creates the app's tables on a fresh database
// (e.g. a newly created Turso DB) that Prisma Migrate can't reach directly
// because its CLI doesn't understand libsql:// connection strings.
// All statements are idempotent (IF NOT EXISTS), so this is safe to re-run.
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ScheduleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "memo" TEXT,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "isTodo" BOOLEAN NOT NULL DEFAULT true,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "remindKakao" BOOLEAN NOT NULL DEFAULT false,
    "remindMinutesBefore" INTEGER NOT NULL DEFAULT 10,
    "reminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiaryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "KakaoAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KakaoAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "ScheduleItem_userId_date_idx" ON "ScheduleItem"("userId", "date")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "DiaryEntry_userId_date_key" ON "DiaryEntry"("userId", "date")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "KakaoAccount_userId_key" ON "KakaoAccount"("userId")`,
];

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const results = [];
  for (const statement of STATEMENTS) {
    try {
      await client.execute(statement);
      results.push({ statement: statement.split("\n")[0].trim(), ok: true });
    } catch (err) {
      results.push({
        statement: statement.split("\n")[0].trim(),
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  client.close();

  return NextResponse.json({ results });
}
