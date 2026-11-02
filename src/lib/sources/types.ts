export type SourceId = "anilibria" | "vost";

export interface CatalogItem {
  source: SourceId;
  id: string;
  code?: string;
  title: string;
  titleAlt?: string;
  poster?: string;
  year?: string | number;
  genres: string[];
  type?: string;
  episodesCount?: string | number;
  description?: string;
}

export interface CatalogResult {
  items: CatalogItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface EpisodeInfo {
  number: string;
  name?: string;
  url?: string;
  qualities?: { label: string; url: string }[];
}

export interface TitleDetails {
  source: SourceId;
  id: string;
  code?: string;
  title: string;
  titleAlt?: string;
  poster?: string;
  year?: string | number;
  genres: string[];
  type?: string;
  status?: string;
  description?: string;
  episodes: EpisodeInfo[];
}
