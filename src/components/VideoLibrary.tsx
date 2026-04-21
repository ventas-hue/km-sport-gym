"use client";

import { useEffect, useState, useCallback } from "react";
import { Video as VideoIcon, Plus, Search, Edit2, Trash2, X, ExternalLink } from "lucide-react";
import VideoEmbed from "./VideoEmbed";
import { parseVideoUrl } from "@/lib/video";

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  tags: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  isPublic: boolean;
}

const CATEGORIES = [
  { value: "chest", label: "Pecho" },
  { value: "back", label: "Espalda" },
  { value: "legs", label: "Piernas" },
  { value: "shoulders", label: "Hombros" },
  { value: "arms", label: "Brazos" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Movilidad" },
  { value: "technique", label: "Tecnica" },
  { value: "tutorial", label: "Tutorial" },
];

const emptyForm = {
  title: "",
  description: "",
  url: "",
  category: "chest",
  tags: "",
  thumbnailUrl: "",
  durationSec: "",
};

interface Props {
  canEdit?: boolean;
}

export default function VideoLibrary({ canEdit = false }: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [playing, setPlaying] = useState<Video | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    fetch(`/api/videos?${params}`)
      .then((r) => r.json())
      .then((d) => setVideos(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/videos/${editingId}` : "/api/videos";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } else {
      alert("Error al guardar");
    }
  };

  const edit = (v: Video) => {
    setForm({
      title: v.title,
      description: v.description ?? "",
      url: v.url,
      category: v.category,
      tags: v.tags ?? "",
      thumbnailUrl: v.thumbnailUrl ?? "",
      durationSec: v.durationSec?.toString() ?? "",
    });
    setEditingId(v.id);
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este video?")) return;
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const categoryLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

  const thumbFor = (v: Video) => v.thumbnailUrl ?? parseVideoUrl(v.url).thumbnailUrl;

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <VideoIcon className="text-rose-500" /> Videoteca
          </h1>
          <p className="text-gray-500 mt-1">{videos.length} videos de ejemplo</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={20} /> Nuevo video
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar video..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        >
          <option value="">Todas las categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <VideoIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin videos</p>
          {canEdit && (
            <p className="text-sm text-gray-400 mt-1">Sube el primer video de ejemplo</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => {
            const thumb = thumbFor(v);
            return (
              <div
                key={v.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <button onClick={() => setPlaying(v)} className="block w-full">
                  {thumb ? (
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={thumb}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-xl">
                          <svg className="w-5 h-5 text-white fill-white ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <VideoIcon className="text-white/50" size={36} />
                    </div>
                  )}
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">
                        {categoryLabel(v.category)}
                      </p>
                      <h3 className="font-bold text-gray-900 mt-0.5 line-clamp-2">
                        {v.title}
                      </h3>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => edit(v)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => remove(v.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {v.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{v.description}</p>
                  )}
                  {v.tags && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {v.tags.split(",").map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {playing && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPlaying(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{playing.title}</h3>
                {playing.description && (
                  <p className="text-sm text-gray-500 mt-1">{playing.description}</p>
                )}
              </div>
              <button
                onClick={() => setPlaying(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <VideoEmbed url={playing.url} title={playing.title} autoplay thumbnailUrl={null} />
            <div className="p-4 flex items-center justify-between text-sm">
              <span className="text-orange-600 font-semibold uppercase text-xs tracking-wider">
                {categoryLabel(playing.category)}
              </span>
              <a
                href={playing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 flex items-center gap-1 text-xs"
              >
                <ExternalLink size={12} /> Ver original
              </a>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? "Editar" : "Nuevo"} video</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, Instagram, TikTok o MP4 directo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separados por coma)
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="glutes, peso corporal, principiante"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL (opcional, se auto-detecta para YouTube)
                </label>
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold"
              >
                {editingId ? "Guardar cambios" : "Crear video"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
