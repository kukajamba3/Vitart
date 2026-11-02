import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "animehub_session";
const SESSION_TTL_DAYS = 30;
const VERIFY_TTL_HOURS = 24;
const RESEND_COOLDOWN_MS = 60_000;

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Создаёт сессию в БД и ставит httpOnly-куку. Вызывать только из route handler / server action. */
export async function createSession(userId: string): Promise<void> {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 3600 * 1000);
  await prisma.session.create({
    data: { token: sha256(raw), userId, expiresAt },
  });
  cookies().set(SESSION_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (raw) {
    try {
      await prisma.session.delete({ where: { token: sha256(raw) } });
    } catch {
      /* сессия уже удалена */
    }
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await prisma.session.findUnique({
    where: { token: sha256(raw) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    try {
      await prisma.session.delete({ where: { token: session.token } });
    } catch {
      /* ignore */
    }
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Создаёт токен подтверждения почты (действует 24 часа). Возвращает токен. */
export async function createVerificationToken(userId: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { userId } });
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFY_TTL_HOURS * 3600 * 1000);
  await prisma.verificationToken.create({ data: { token, userId, expiresAt } });
  return token;
}

/** True, если токен валиден и почта подтверждена */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expiresAt < new Date()) return false;
  await prisma.$transaction([
    prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);
  return true;
}

/** Простой анти-спам: не чаще одного письма в минуту на пользователя */
export async function canSendVerification(userId: string): Promise<boolean> {
  const last = await prisma.verificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return !last || Date.now() - last.createdAt.getTime() >= RESEND_COOLDOWN_MS;
}
