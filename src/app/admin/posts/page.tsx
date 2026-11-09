"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  Calendar,
} from "lucide-react";

interface PostRow {
  id: string;
  title: string | null;
  body: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string;
  images: Array<{ id: string; url: string; order: number }>;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/posts?published=false&limit=200")
      .then((r) => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = posts.filter((p) => {
    if (filter === "all") return true;
    if (filter === "published") return p.isPublished;
    return !p.isPublished;
  });

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Publicaciones</h1>
          <p className="text-white/50 text-sm mt-1">
            Sube fotos y texto. Aparecen en la página principal y se pueden compartir en redes sociales.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-orange-500 text-white font-medium shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition"
        >
          <Plus size={18} />
          Nueva publicación
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-3 text-xs rounded-lg border transition ${
              filter === f
                ? "bg-white/[0.08] border-white/20 text-white"
                : "bg-transparent border-white/10 text-white/50 hover:bg-white/[0.04]"
            }`}
          >
            {f === "all" ? "Todas" : f === "published" ? "Publicadas" : "Borradores"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-white/40 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          No hay publicaciones todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden"
            >
              {p.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0].url}
                  alt={p.title ?? "post"}
                  className="w-full h-48 object-cover bg-black/40"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-white/[0.02] text-white/30">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold tracking-tight line-clamp-1 flex-1">
                    {p.title ?? "(sin título)"}
                  </h3>
                  {p.isPublished ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 inline-flex items-center gap-1">
                      <Eye size={10} /> Publicada
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/10 inline-flex items-center gap-1">
                      <EyeOff size={10} /> Borrador
                    </span>
                  )}
                </div>
                {p.body && (
                  <p className="text-xs text-white/60 line-clamp-2 mb-3">{p.body}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(p.publishedAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {p.tags && (
                    <span className="truncate max-w-[180px] text-orange-300/70">
                      #{p.tags.split(",").join(" #")}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition"
                  >
                    <Edit3 size={13} /> Editar
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-white/50 flex items-center justify-center transition"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
