import { NextResponse } from "next/server";
import * as anilibria from "@/lib/sources/anilibria";
import * as animevost from "@/lib/sources/animevost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Живой поиск по обоим источникам для выпадающего списка в шапке */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [al, av] = await Promise.allSettled([
    anilibria.findByName(q, 6),
    animevost.search(q, 6),
  ]);

  const results: any[] = [];
  if (al.status === "fulfilled") {
    for (const it of al.value) {
      if (!it.code) continue;
      results.push({
        source: "anilibria",
        id: it.id,
        title: it.title,
        poster: it.poster,
        year: it.year,
        href: `/title/${it.code}`,
      });
    }
  }
  if (av.status === "fulfilled") {
    for (const it of av.value) {
      results.push({
        source: "vost",
        id: it.id,
        title: it.title,
        poster: it.poster,
        year: it.year,
        href: `/vost/${it.id}`,
      });
    }
  }
  return NextResponse.json({ results: results.slice(0, 10) });
}
