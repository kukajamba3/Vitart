"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

interface Quality {
  label: string;
  url: string;
}

export default function Player({
  qualities,
  poster,
}: {
  qualities: Quality[];
  poster?: string;
}) {
  const [qi, setQi] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const url = qualities[qi]?.url;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;
        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url; // Safari
      }
    } else {
      video.src = url;
    }
  }, [url]);

  if (!url) return null;

  return (
    <div>
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        className="aspect-video w-full rounded-xl border border-white/10 bg-black"
      />
      {qualities.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Качество:</span>
          {qualities.map((q, i) => (
            <button
              key={q.label}
              onClick={() => setQi(i)}
              className={
                i === qi
                  ? "rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white"
                  : "rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10"
              }
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
