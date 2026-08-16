import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "이메일과 6자 이상 비밀번호를 입력해주세요." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
