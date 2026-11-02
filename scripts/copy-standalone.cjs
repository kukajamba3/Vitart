/**
 * Prisma + Next.js standalone: копирует сгенерированный клиент и движок
 * Prisma внутрь .next/standalone/node_modules, чтобы SSR-контейнер Layero
 * мог выполнять запросы к БД без отдельного `prisma generate`.
 */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(standalone)) {
  console.log("[copy-standalone] .next/standalone не найден — пропускаем");
  process.exit(0);
}

const copyInto = (srcRel) => {
  const src = path.join(root, srcRel);
  const dest = path.join(standalone, srcRel);
  if (!fs.existsSync(src)) {
    console.log(`[copy-standalone] нет ${srcRel} — пропускаем`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[copy-standalone] скопировано ${srcRel} -> .next/standalone/${srcRel}`);
};

// сгенерированный клиент Prisma (в т.ч. libquery_engine-*.so.node)
copyInto("node_modules/.prisma");
// движки Prisma (запасной вариант)
copyInto("node_modules/@prisma/engines");
// схема — нужна некоторым операциям клиента
copyInto("prisma");
