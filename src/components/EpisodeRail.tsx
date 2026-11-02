import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EpisodeLink {
  number: string;
  name?: string;
  href: string;
}

export default function EpisodeRail({
  episodes,
  current,
}: {
  episodes: EpisodeLink[];
  current?: string;
}) {
  if (episodes.length === 0) {
    return <p className="text-sm text-zinc-500">Серии пока не добавлены.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {episodes.map((ep) => (
        <Link
          key={ep.number}
          href={ep.href}
          title={ep.name}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition",
            ep.number === current
              ? "border-violet-500 bg-violet-600/25 font-semibold text-white"
              : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
          )}
        >
          Серия {ep.number}
        </Link>
      ))}
    </div>
  );
}
