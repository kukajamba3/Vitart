import Link from "next/link";
import type { CatalogItem } from "@/lib/sources/types";

export default function TitleCard({ item }: { item: CatalogItem }) {
  const href = item.source === "vost" ? `/vost/${item.id}` : `/title/${item.code}`;
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">нет постера</div>
        )}
        {item.year ? (
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-zinc-200">
            {item.year}
          </span>
        ) : null}
      </div>
      <div
        className="mt-2 truncate text-sm font-medium text-zinc-100 group-hover:text-violet-300"
        title={item.title}
      >
        {item.title}
      </div>
      {item.genres?.length ? (
        <div className="truncate text-xs text-zinc-500">{item.genres.slice(0, 3).join(" • ")}</div>
      ) : null}
    </Link>
  );
}
