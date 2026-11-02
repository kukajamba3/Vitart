import { NextResponse } from "next/server";
import { z } from "zod";
import { canSendVerification, createVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Не палим существование аккаунта наружу — всегда отвечаем ok
  if (user && !user.emailVerified && (await canSendVerification(user.id))) {
    const token = await createVerificationToken(user.id);
    try {
      await sendVerificationEmail(email, token);
    } catch (e) {
      console.error("Resend error:", e);
    }
  }
  return NextResponse.json({ ok: true });
}
