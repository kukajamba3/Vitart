import Link from "next/link";
import EpisodeRail, { type EpisodeLink } from "./EpisodeRail";
import Player from "./Player";
import VoiceSelector, { type VoiceOption } from "./VoiceSelector";

interface Props {
  title: string;
  titleAlt?: string;
  poster?: string;
  year?: string | number;
  genres: string[];
  type?: string;
  status?: string;
  description?: string;
  voiceOptions: VoiceOption[];
  episodes: EpisodeLink[];
  currentEp?: string;
  qualities?: { label: string; url: string }[];
}

export default function TitleView(p: Props) {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:w-52">
          {p.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.poster} alt={p.title} className="aspect-[2/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center text-xs text-zinc-600">
              нет постера
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{p.title}</h1>
          {p.titleAlt ? <p className="mt-1 text-sm text-zinc-400">{p.titleAlt}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {p.year ? <span className="rounded-md bg-white/5 px-2 py-1">{p.year}</span> : null}
            {p.type ? <span className="rounded-md bg-white/5 px-2 py-1">{p.type}</span> : null}
            {p.status ? <span className="rounded-md bg-white/5 px-2 py-1">{p.status}</span> : null}
            {p.genres.map((g) => (
              <Link
                key={g}
                href={`/catalog?genre=${encodeURIComponent(g)}`}
                className="rounded-md bg-violet-600/20 px-2 py-1 text-violet-300 hover:bg-violet-600/30"
              >
                {g}
              </Link>
            ))}
          </div>
          <div className="mt-4 max-h-40 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {p.description || "Описание отсутствует."}
          </div>
          <div className="mt-4">
            <VoiceSelector options={p.voiceOptions} />
          </div>
        </div>
      </div>

      <section className="mt-8">
        {p.qualities && p.qualities.length > 0 ? (
          <Player qualities={p.qualities} poster={p.poster} />
        ) : (
          <div className="rounded-xl border border-white/10 bg-panel p-6 text-sm text-zinc-400">
            Видео для этой серии пока недоступно. Попробуйте другую озвучку или зайдите позже.
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-white">Серии</h2>
        <EpisodeRail episodes={p.episodes} current={p.currentEp} />
      </section>
    </div>
  );
}
