import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Некорректные данные" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { ok: false, error: "Неверный e-mail или пароль" },
      { status: 401 }
    );
  }
  if (!user.emailVerified) {
    return NextResponse.json(
      {
        ok: false,
        code: "unverified",
        error: "Почта не подтверждена. Отправьте письмо повторно кнопкой ниже.",
      },
      { status: 403 }
    );
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
