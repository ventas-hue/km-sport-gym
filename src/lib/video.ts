// Parses video URLs and returns embed metadata

export type VideoProvider = "youtube" | "vimeo" | "instagram" | "tiktok" | "direct" | "unknown";

export interface VideoInfo {
  provider: VideoProvider;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  watchUrl: string;
}

export function parseVideoUrl(url: string): VideoInfo {
  if (!url) {
    return { provider: "unknown", embedUrl: null, thumbnailUrl: null, watchUrl: url };
  }

  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    const id = yt[1];
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      watchUrl: url,
    };
  }

  // Vimeo
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if (vim) {
    const id = vim[1];
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null,
      watchUrl: url,
    };
  }

  // Instagram
  if (/instagram\.com\/(?:p|reel|tv)\//.test(url)) {
    const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
    const short = m ? m[1] : "";
    return {
      provider: "instagram",
      embedUrl: short ? `https://www.instagram.com/p/${short}/embed` : null,
      thumbnailUrl: null,
      watchUrl: url,
    };
  }

  // TikTok
  if (/tiktok\.com\//.test(url)) {
    return { provider: "tiktok", embedUrl: null, thumbnailUrl: null, watchUrl: url };
  }

  // Direct video
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return { provider: "direct", embedUrl: url, thumbnailUrl: null, watchUrl: url };
  }

  return { provider: "unknown", embedUrl: null, thumbnailUrl: null, watchUrl: url };
}
