import { notFound } from "next/navigation";
import TitleView from "@/components/TitleView";
import type { VoiceOption } from "@/components/VoiceSelector";
import { getTitle } from "@/lib/sources/anilibria";
import { getTitle as getVostTitle } from "@/lib/sources/animevost";
import { findVostMatch } from "@/lib/sources";

export const revalidate = 300;

export default async function TitlePage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const code = params.code;
  const src = String(searchParams.src ?? "anilibria");
  const aid = String(searchParams.aid ?? "");
  const ep = String(searchParams.ep ?? "");

  // ── Вариант озвучки AnimeVost для этого же тайтла ──
  if (src === "vost") {
    if (!aid) notFound();
    let vt;
    try {
      vt = await getVostTitle(aid);
    } catch {
      notFound();
    }
    const al = await getTitle(code).catch(() => null);
    const eps = vt.episodes;
    const current = eps.some((e) => e.number === ep) ? ep : eps[0]?.number;
    const curEp = eps.find((e) => e.number === current);

    const voiceOptions: VoiceOption[] = [
      ...(al
        ? [{ label: "AniLibria", href: `/title/${code}?ep=${current ?? 1}`, active: false }]
        : []),
      {
        label: "AnimeVost",
        href: `/title/${code}?src=vost&aid=${aid}&ep=${current ?? 1}`,
        active: true,
      },
    ];

    return (
      <TitleView
        title={vt.title}
        titleAlt={vt.titleAlt}
        poster={vt.poster}
        year={vt.year}
        genres={vt.genres}
        type={vt.type}
        description={vt.description}
        voiceOptions={voiceOptions}
        episodes={eps.map((e) => ({
          number: e.number,
          name: e.name,
          href: `/title/${code}?src=vost&aid=${aid}&ep=${e.number}`,
        }))}
        currentEp={current}
        qualities={curEp?.qualities?.length ? curEp.qualities : curEp?.url ? [{ label: "auto", url: curEp.url }] : undefined}
      />
    );
  }

  // ── Основной вариант (AniLibria) ──
  const t = await getTitle(code).catch(() => null);
  if (!t) notFound();
  const vost = await findVostMatch({ titleAlt: t.titleAlt, title: t.title });

  const eps = t.episodes;
  const current = eps.some((e) => e.number === ep) ? ep : eps[0]?.number;
  const curEp = eps.find((e) => e.number === current);

  const voiceOptions: VoiceOption[] = [
    { label: "AniLibria", href: `/title/${code}?ep=${current ?? 1}`, active: true },
    ...(vost
      ? [
          {
            label: "AnimeVost",
            href: `/title/${code}?src=vost&aid=${vost.id}&ep=${current ?? 1}`,
            active: false,
          },
        ]
      : []),
  ];

  return (
    <TitleView
      title={t.title}
      titleAlt={t.titleAlt}
      poster={t.poster}
      year={t.year}
      genres={t.genres}
      type={t.type}
      status={t.status}
      description={t.description}
      voiceOptions={voiceOptions}
      episodes={eps.map((e) => ({
        number: e.number,
        name: e.name,
        href: `/title/${code}?ep=${e.number}`,
      }))}
      currentEp={current}
      qualities={curEp?.qualities}
    />
  );
}
