import Link from "next/link";
import { cn } from "@/lib/utils";

export interface VoiceOption {
  label: string;
  href: string;
  active: boolean;
}

/** Выбор озвучки — единственное место в UI, где видны названия источников */
export default function VoiceSelector({ options }: { options: VoiceOption[] }) {
  if (options.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-400">Озвучка:</span>
      <div className="flex overflow-hidden rounded-lg border border-white/10">
        {options.map((o) => (
          <Link
            key={o.label}
            href={o.href}
            className={cn(
              "px-3 py-1.5 text-sm transition",
              o.active
                ? "bg-violet-600 font-semibold text-white"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
