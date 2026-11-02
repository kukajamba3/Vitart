import * as anilibria from "./anilibria";
import * as animevost from "./animevost";
import type { CatalogItem } from "./types";

/** Нормализация названия для нечёткого сопоставления между источниками */
export function normalizeName(s?: string | null): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "");
}

function bestMatch<T extends { title: string; titleAlt?: string }>(
  query: string,
  items: T[]
): T | undefined {
  const n = normalizeName(query);
  if (!n) return items[0];
  return (
    items.find(
      (it) =>
        normalizeName(it.titleAlt).includes(n) ||
        n.includes(normalizeName(it.titleAlt)) ||
        normalizeName(it.title).includes(n) ||
        n.includes(normalizeName(it.title))
    ) ?? items[0]
  );
}

/** Ищет тот же тайтл в AnimeVost по английскому/русскому названию */
export async function findVostMatch(t: {
  title?: string;
  titleAlt?: string;
}): Promise<{ id: string } | null> {
  for (const q of [t.titleAlt, t.title]) {
    if (!q) continue;
    try {
      const res = await animevost.search(q, 5);
      const hit = bestMatch(q, res);
      if (hit) return { id: hit.id };
    } catch {
      /* источник недоступен — просто не покажем альтернативу */
    }
  }
  return null;
}

/** Ищет тот же тайтл в AniLibria по оригинальному/русскому названию */
export async function findAnilibriaMatch(t: {
  title?: string;
  titleAlt?: string;
}): Promise<{ code: string } | null> {
  for (const q of [t.titleAlt, t.title]) {
    if (!q) continue;
    try {
      const res = await anilibria.findByName(q, 5);
      const hit = bestMatch(q, res as CatalogItem[]);
      if (hit?.code) return { code: hit.code };
    } catch {
      /* ignore */
    }
  }
  return null;
}
