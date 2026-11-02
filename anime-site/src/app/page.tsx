import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import { getPopular, getScheduleToday, getUpdates } from "@/lib/sources/anilibria";
import type { CatalogItem } from "@/lib/sources/types";

export const revalidate = 600;

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items: CatalogItem[];
  empty?: boolean;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link href="/catalog" className="text-sm text-violet-300 hover:underline">
          Весь каталог →
        </Link>
      </div>
      {empty ? (
        <p className="text-sm text-zinc-500">Не удалось загрузить данные. Попробуйте позже.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((it) => (
            <TitleCard key={it.source + it.id} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function Home() {
  const [updates, popular, schedule] = await Promise.allSettled([
    getUpdates(18),
    getPopular(12),
    getScheduleToday(12),
  ]);
  const up = updates.status === "fulfilled" ? updates.value : [];
  const pop = popular.status === "fulfilled" ? popular.value : [];
  const sch = schedule.status === "fulfilled" ? schedule.value : [];

  return (
    <div>
      <section className="mt-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-panel to-ink p-8 sm:p-12">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          Смотрите аниме онлайн в хорошей озвучке
        </h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Тысячи тайтлов: поиск по названию, фильтры по жанрам и годам, свежие серии каждый день.
        </p>
        <form action="/catalog" className="mt-6 flex max-w-xl gap-2">
          <input
            name="q"
            placeholder="Например: Наруто, Атака титанов, Ванпанчмен..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Найти
          </button>
        </form>
        <div className="mt-4 flex gap-2 text-sm">
          <Link
            href="/catalog"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            Открыть каталог
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      <Section title="Свежие обновления" items={up} empty={up.length === 0} />
      <Section title="Популярное" items={pop} empty={pop.length === 0} />
      <Section title="Выходят сегодня" items={sch} empty={sch.length === 0} />
    </div>
  );
}
