import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendVerification, createVerificationToken, hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(60).optional().nullable(),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Проверьте поля: email корректен, пароль от 6 символов" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;
  const name = parsed.data.name?.length ? parsed.data.name : null;
  const normalized = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing?.emailVerified) {
    return NextResponse.json(
      { ok: false, error: "Этот e-mail уже зарегистрирован. Войдите или восстановите пароль." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, name: name ?? existing.name, emailVerified: false },
      })
    : await prisma.user.create({
        data: { email: normalized, name, passwordHash },
      });

  if (!(await canSendVerification(user.id))) {
    return NextResponse.json(
      { ok: false, error: "Письмо уже отправлено. Подождите минуту и попробуйте снова." },
      { status: 429 }
    );
  }

  const token = await createVerificationToken(user.id);
  let emailSent = true;
  try {
    await sendVerificationEmail(normalized, token);
  } catch (e) {
    console.error("Resend error:", e);
    emailSent = false;
  }

  return NextResponse.json({ ok: true, emailSent });
}
