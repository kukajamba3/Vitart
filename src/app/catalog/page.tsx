import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import { searchCatalog } from "@/lib/sources/anilibria";
import type { CatalogResult } from "@/lib/sources/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const GENRES = [
  "Экшен", "Приключения", "Комедия", "Драма", "Фэнтези", "Романтика",
  "Повседневность", "Сёнен", "Сёдзё", "Меха", "Исекай", "Ужасы",
  "Мистика", "Детектив", "Спорт", "Супергерои", "Вампиры", "Исторический",
  "Школа", "Военное", "Космос", "Магия", "Пародия", "Триллер", "Фантастика",
];
const YEARS = Array.from({ length: 17 }, (_, i) => String(2026 - i));

export default async function Catalog({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = String(searchParams.q ?? "");
  const genre = String(searchParams.genre ?? "");
  const year = String(searchParams.year ?? "");
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);

  let result: CatalogResult = { items: [], page, pageSize: 24, hasMore: false };
  let error = "";
  try {
    result = await searchCatalog({
      q: q || undefined,
      genre: genre || undefined,
      year: year || undefined,
      page,
      limit: 24,
    });
  } catch {
    error = "Не удалось загрузить каталог. Источник данных временно недоступен — попробуйте позже.";
  }

  const href = (over: { q?: string; genre?: string; year?: string; page?: number }) => {
    const p = new URLSearchParams();
    const qq = over.q ?? q;
    const gg = over.genre ?? genre;
    const yy = over.year ?? year;
    const pp = over.page ?? page;
    if (qq) p.set("q", qq);
    if (gg) p.set("genre", gg);
    if (yy) p.set("year", yy);
    if (pp > 1) p.set("page", String(pp));
    const s = p.toString();
    return s ? `/catalog?${s}` : "/catalog";
  };

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-extrabold text-white">Каталог аниме</h1>

      <form
        action="/catalog"
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-panel p-4"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500 sm:w-64"
        />
        <select
          name="genre"
          defaultValue={genre}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
        >
          <option value="">Все жанры</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          name="year"
          defaultValue={year}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
        >
          <option value="">Любой год</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Применить
        </button>
        {(q || genre || year) && (
          <Link href="/catalog" className="px-2 text-sm text-zinc-400 hover:text-white">
            Сбросить
          </Link>
        )}
      </form>

      {genre && (
        <div className="mt-3 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g}
              href={href({ genre: g, page: 1 })}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs",
                g === genre
                  ? "border-violet-500 bg-violet-600/25 text-white"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              {g}
            </Link>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      ) : (
        <>
          <p className="mt-4 text-xs text-zinc-500">
            Найдено: {result.items.length > 0 ? `${result.items.length}+` : "0"} · страница {page}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {result.items.map((it) => (
              <TitleCard key={it.source + it.id} item={it} />
            ))}
          </div>
          {result.items.length === 0 && (
            <p className="mt-6 text-sm text-zinc-500">
              По запросу «{q}» ничего не найдено. Попробуйте изменить поиск.
            </p>
          )}
          {(page > 1 || result.hasMore) && (
            <div className="mt-6 flex items-center gap-3">
              {page > 1 && (
                <Link
                  href={href({ page: page - 1 })}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  ← Назад
                </Link>
              )}
              {result.hasMore && (
                <Link
                  href={href({ page: page + 1 })}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Далее →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
