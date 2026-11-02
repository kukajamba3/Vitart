import type { CatalogItem, CatalogResult, EpisodeInfo, TitleDetails } from "./types";
import { stripTags } from "../utils";

// Публичное API AniLibria, ключ не требуется. Базу можно переопределить через ANILIBRIA_API_BASE.
const API = process.env.ANILIBRIA_API_BASE ?? "https://api.anilibria.tv/v2.1";
const SITE = process.env.ANILIBRIA_SITE ?? "https://anilibria.tv";

const LIGHT_FILTER =
  "id,code,names,posters,genres,type,status,season,in_favorites,updated";

async function apiGet(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<any> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const res = await fetch(`${API}${path}?${qs.toString()}`, {
    headers: { "User-Agent": "animehub-site/1.0" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`AniLibria ${path} -> HTTP ${res.status}`);
  return res.json();
}

export function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  return `${SITE}${u.startsWith("/") ? "" : "/"}${u}`;
}

function mapCatalogItem(t: any): CatalogItem {
  return {
    source: "anilibria",
    id: String(t.id),
    code: t.code,
    title: t.names?.ru ?? t.names?.en ?? "Без названия",
    titleAlt: t.names?.en ?? t.names?.alternative ?? undefined,
    poster: absUrl(t.posters?.original?.url ?? t.poster),
    year: t.season?.year ?? t.year,
    genres: Array.isArray(t.genres) ? t.genres : [],
    type: t.type?.string,
    episodesCount: t.type?.episodes ?? undefined,
    description: stripTags(t.description),
  };
}

export interface SearchParams {
  q?: string;
  genre?: string;
  year?: string;
  page?: number;
  limit?: number;
}

/** Поиск по каталогу: searchTitles поддерживает search / genres / year / page / limit */
export async function searchCatalog(p: SearchParams): Promise<CatalogResult> {
  const limit = p.limit ?? 24;
  const page = Math.max(1, p.page ?? 1);
  const data = await apiGet("/searchTitles", {
    search: p.q,
    genres: p.genre,
    year: p.year,
    filter: LIGHT_FILTER,
    description_type: "plain",
    limit,
    page,
  });
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  const items = arr.map(mapCatalogItem);
  return { items, page, pageSize: limit, hasMore: items.length >= limit };
}

/** Популярное: сортировка по in_favorites через advancedSearch, фолбэк — обычный поиск */
export async function getPopular(limit = 12): Promise<CatalogItem[]> {
  try {
    const data = await apiGet("/advancedSearch", {
      query: "{in_favorites} >= 0",
      order_by: "in_favorites",
      sort_direction: 1,
      limit,
      filter: LIGHT_FILTER,
      description_type: "plain",
    });
    return (Array.isArray(data) ? data : []).map(mapCatalogItem);
  } catch {
    const data = await apiGet("/searchTitles", {
      limit,
      filter: LIGHT_FILTER,
      description_type: "plain",
    });
    return (Array.isArray(data) ? data : []).map(mapCatalogItem);
  }
}

/** Свежие обновления релизов */
export async function getUpdates(limit = 18): Promise<CatalogItem[]> {
  const data = await apiGet("/getUpdates", {
    limit,
    filter: LIGHT_FILTER,
    description_type: "plain",
  });
  return (Array.isArray(data) ? data : []).map(mapCatalogItem);
}

/** Расписание выхода серий на сегодня (0 = понедельник) */
export async function getScheduleToday(limit = 12): Promise<CatalogItem[]> {
  const day = (new Date().getDay() + 6) % 7;
  const data = await apiGet("/getSchedule", {
    days: String(day),
    filter: LIGHT_FILTER,
    description_type: "plain",
  });
  const arr: any[] = Array.isArray(data) ? data : [];
  const today = arr.find((d) => Number(d.day) === day);
  return ((today?.list ?? []) as any[]).slice(0, limit).map(mapCatalogItem);
}

/** Полная карточка тайтла со списком серий и HLS-ссылками плеера */
export async function getTitle(code: string): Promise<TitleDetails> {
  const t = await apiGet("/getTitle", {
    code,
    playlist_type: "array",
    description_type: "plain",
  });
  return mapTitle(t);
}

function mapTitle(t: any): TitleDetails {
  const player = t.player ?? {};
  const host: string | undefined = player.host;
  const pl = player.playlist ?? player.list ?? {};
  const list: any[] = Array.isArray(pl) ? pl : Object.values(pl);

  const episodes: EpisodeInfo[] = list
    .map((ep: any) => {
      const qualities: { label: string; url: string }[] = [];
      const hls = ep.hls ?? {};
      const push = (label: string, path?: string) => {
        if (!path) return;
        qualities.push({
          label,
          url: path.startsWith("http") ? path : `https://${host}${path}`,
        });
      };
      push("1080p", hls.fhd);
      push("720p", hls.hd);
      push("480p", hls.sd);
      return {
        number: String(ep.episode),
        name: ep.name ?? undefined,
        url: qualities[0]?.url,
        qualities,
      };
    })
    .sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

  return {
    source: "anilibria",
    id: String(t.id),
    code: t.code,
    title: t.names?.ru ?? t.names?.en ?? "",
    titleAlt: t.names?.en ?? t.names?.alternative ?? undefined,
    poster: absUrl(t.posters?.original?.url ?? t.poster),
    year: t.season?.year ?? t.year,
    genres: Array.isArray(t.genres) ? t.genres : [],
    type: t.type?.full_string ?? t.type?.string,
    status: t.status?.string,
    description: stripTags(t.description),
    episodes,
  };
}

/** Поиск по имени (для сопоставления тайтлов между источниками и живого поиска) */
export async function findByName(name: string, limit = 6): Promise<CatalogItem[]> {
  const data = await apiGet("/searchTitles", {
    search: name,
    limit,
    filter: LIGHT_FILTER,
    description_type: "plain",
  });
  return (Array.isArray(data) ? data : []).map(mapCatalogItem);
}
