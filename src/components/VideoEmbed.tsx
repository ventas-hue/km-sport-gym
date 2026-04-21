"use client";

import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { parseVideoUrl } from "@/lib/video";

interface Props {
  url: string;
  title?: string;
  thumbnailUrl?: string | null;
  className?: string;
  autoplay?: boolean;
}

export default function VideoEmbed({
  url,
  title,
  thumbnailUrl,
  className = "",
  autoplay = false,
}: Props) {
  const info = parseVideoUrl(url);
  const [playing, setPlaying] = useState(autoplay);

  if (!info.embedUrl) {
    return (
      <a
        href={info.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block bg-gray-900 rounded-xl overflow-hidden group ${className}`}
      >
        <div className="aspect-video flex items-center justify-center text-white">
          <div className="text-center">
            <ExternalLink size={28} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Abrir video</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{info.provider}</p>
          </div>
        </div>
      </a>
    );
  }

  const thumb = thumbnailUrl ?? info.thumbnailUrl;

  if (!playing && thumb) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className={`relative block bg-black rounded-xl overflow-hidden group cursor-pointer w-full ${className}`}
      >
        <div className="aspect-video relative">
          <Image
            src={thumb}
            alt={title ?? "Video"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={28} className="text-white fill-white ml-1" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-sm font-semibold text-white line-clamp-2">{title}</p>
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      <div className="aspect-video">
        {info.provider === "direct" ? (
          <video
            src={info.embedUrl}
            controls
            autoPlay={playing}
            className="w-full h-full"
          />
        ) : (
          <iframe
            src={playing ? `${info.embedUrl}${info.embedUrl.includes("?") ? "&" : "?"}autoplay=1` : info.embedUrl}
            title={title ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
