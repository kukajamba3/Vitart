import { notFound } from "next/navigation";
import TitleView from "@/components/TitleView";
import type { VoiceOption } from "@/components/VoiceSelector";
import { getTitle as getVostTitle } from "@/lib/sources/animevost";
import { findAnilibriaMatch } from "@/lib/sources";

export const revalidate = 300;

export default async function VostTitlePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const id = params.id;
  const ep = String(searchParams.ep ?? "");

  let t;
  try {
    t = await getVostTitle(id);
  } catch {
    notFound();
  }

  const al = await findAnilibriaMatch({ titleAlt: t.titleAlt, title: t.title });

  const eps = t.episodes;
  const current = eps.some((e) => e.number === ep) ? ep : eps[0]?.number;
  const curEp = eps.find((e) => e.number === current);

  const voiceOptions: VoiceOption[] = [
    { label: "AnimeVost", href: `/vost/${id}?ep=${current ?? 1}`, active: true },
    ...(al
      ? [{ label: "AniLibria", href: `/title/${al.code}?ep=${current ?? 1}`, active: false }]
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
      description={t.description}
      voiceOptions={voiceOptions}
      episodes={eps.map((e) => ({
        number: e.number,
        name: e.name,
        href: `/vost/${id}?ep=${e.number}`,
      }))}
      currentEp={current}
      qualities={
        curEp?.qualities?.length
          ? curEp.qualities
          : curEp?.url
            ? [{ label: "auto", url: curEp.url }]
            : undefined
      }
    />
  );
}
