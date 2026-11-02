"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Result {
  source: string;
  id: string;
  code?: string;
  title: string;
  poster?: string;
  year?: string | number;
  href: string;
}

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setResults(d.results ?? []);
        setOpen(true);
      } catch {
        /* ignore */
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            setOpen(false);
            router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Найти аниме..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500"
        />
      </form>
      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-white/10 bg-panel shadow-2xl">
          {loading && <div className="px-3 py-3 text-sm text-zinc-500">Поиск...</div>}
          {!loading && results.length === 0 && q.trim().length >= 2 && (
            <div className="px-3 py-3 text-sm text-zinc-500">Ничего не найдено</div>
          )}
          {results.map((r) => (
            <Link
              key={r.source + r.id}
              href={r.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
            >
              {r.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.poster} alt="" className="h-10 w-7 shrink-0 rounded object-cover" />
              ) : (
                <div className="h-10 w-7 shrink-0 rounded bg-white/10" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm text-white">{r.title}</div>
                {r.year ? <div className="text-xs text-zinc-500">{r.year}</div> : null}
              </div>
            </Link>
          ))}
          {results.length > 0 && (
            <Link
              href={`/catalog?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="block border-t border-white/5 px-3 py-2 text-center text-xs text-violet-300 hover:bg-white/5"
            >
              Все результаты →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
