import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// На Layero подключённая база приезжает как LAYERO_DATABASE_URL,
// локально/на своём сервере используем DATABASE_URL.
const dbUrl = process.env.DATABASE_URL ?? process.env.LAYERO_DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
