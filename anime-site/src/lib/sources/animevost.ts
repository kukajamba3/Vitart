import type { CatalogItem, CatalogResult, EpisodeInfo, TitleDetails } from "./types";
import { stripTags } from "../utils";

// API AnimeVost (зеркало можно сменить через ANIVOST_API_BASE)
const API = process.env.ANIVOST_API_BASE ?? "https://api.animevost.org/v1";
const STATIC = "https://static.openni.ru";

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
  if (!res.ok) throw new Error(`AnimeVost ${path} -> HTTP ${res.status}`);
  return res.json();
}

async function apiPost(path: string, body: Record<string, string>): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "animehub-site/1.0",
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`AnimeVost ${path} -> HTTP ${res.status}`);
  return res.json();
}

function fixUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http")) return u;
  return `${STATIC}${u.startsWith("/") ? "" : "/"}${u}`;
}

/**
 * Заголовок вида "Русское название / Original Name [1-12 из 12+]"
 * разбирается на части.
 */
export function parseAvTitle(raw: string): {
  title: string;
  original: string;
  episodes: string;
} {
  const parts = (raw ?? "").split("/");
  const title = (parts[0] ?? raw ?? "").trim();
  const rest = (parts[1] ?? "").trim();
  const m = rest.match(/\[([^\]]+)\]/);
  const episodes = m?.[1]?.trim() ?? "";
  const original = rest.replace(/\[.*?\]/, "").trim();
  return { title, original, episodes };
}

function mapItem(t: any): CatalogItem {
  const p = parseAvTitle(t.title ?? "");
  return {
    source: "vost",
    id: String(t.id),
    title: p.title || String(t.id),
    titleAlt: p.original || undefined,
    poster: fixUrl(t.urlImagePreview),
    year: t.year ? String(t.year) : undefined,
    genres:
      typeof t.genre === "string"
        ? t.genre
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    type: t.type,
    episodesCount: p.episodes || undefined,
    description: stripTags(t.description),
  };
}

export async function search(q: string, limit = 10): Promise<CatalogItem[]> {
  const res = await apiPost("/search", { name: q });
  const data = Array.isArray(res) ? res : res?.data ?? [];
  return data.slice(0, limit).map(mapItem);
}

export async function last(page = 1, quantity = 24): Promise<CatalogResult> {
  const res = await apiGet("/last", { page, quantity });
  const data = Array.isArray(res) ? res : res?.data ?? [];
  const items = data.map(mapItem);
  return { items, page, pageSize: quantity, hasMore: items.length >= quantity };
}

export async function info(id: string | number): Promise<any> {
  return apiPost("/info", { id: String(id) });
}

export async function playlist(id: string | number): Promise<EpisodeInfo[]> {
  const res = await apiPost("/playlist", { id: String(id) });
  const list: any[] = Array.isArray(res) ? res : [];
  return list
    .map((el: any) => {
      const hd = fixUrl(el.hd);
      const std = fixUrl(el.std);
      const qualities = (
        [
          hd ? { label: "HD", url: hd } : null,
          std ? { label: "SD", url: std } : null,
        ].filter(Boolean) as { label: string; url: string }[]
      );
      const name = el.name ? String(el.name) : "";
      const num = name.match(/\d+/)?.[0] ?? name;
      return {
        number: num || "0",
        name: name || undefined,
        url: hd ?? std,
        qualities,
      };
    })
    .sort((a, b) => (parseFloat(a.number) || 9999) - (parseFloat(b.number) || 9999));
}

export async function getTitle(id: string | number): Promise<TitleDetails> {
  const [item, eps] = await Promise.all([info(id), playlist(id)]);
  const p = parseAvTitle(item?.title ?? "");
  return {
    source: "vost",
    id: String(id),
    title: p.title,
    titleAlt: p.original || undefined,
    poster: fixUrl(item?.urlImagePreview),
    year: item?.year ? String(item.year) : undefined,
    genres:
      typeof item?.genre === "string"
        ? item.genre
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    type: item?.type,
    description: stripTags(item?.description),
    episodes: eps,
  };
}
