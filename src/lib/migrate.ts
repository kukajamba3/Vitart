import { prisma } from "./prisma";

/**
 * Идемпотентное создание таблиц при первом старте сервера.
 * Страховка на случай, если миграция на стадии сборки была пропущена
 * (например, DATABASE_URL ещё не задан): CREATE TABLE IF NOT EXISTS.
 */
const SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "Session" (
  "token" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "token" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "VerificationToken_userId_idx" ON "VerificationToken"("userId");
`;

let done: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!done) {
    done = (async () => {
      if (!process.env.DATABASE_URL && !process.env.LAYERO_DATABASE_URL) return;
      await prisma.$executeRawUnsafe(SQL);
    })().catch((e) => {
      console.error("[db] ensureDb failed:", e);
      done = null; // позволим повторить при следующем запросе
    });
  }
  return done;
}
