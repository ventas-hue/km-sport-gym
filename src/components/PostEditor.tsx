"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  X,
  Save,
  Share2,
  Eye,
  EyeOff,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Instagram,
  Download,
  CheckCircle,
} from "lucide-react";

interface UploadedImage {
  id: string;
  url: string;
}

const TAGS = [
  "galeria",
  "noticia",
  "promo",
  "logro",
  "instalaciones",
  "testimonios",
  "evento",
];

interface Props {
  postId?: string;
}

export default function PostEditor({ postId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>(["galeria"]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [savedId, setSavedId] = useState<string | undefined>(postId);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}`);
    if (res.ok) {
      const d = await res.json();
      setTitle(d.title ?? "");
      setBody(d.body ?? "");
      setTags(d.tags ? d.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []);
      setIsPublished(d.isPublished);
      setImages(d.images ?? []);
    }
    setLoading(false);
  }, [postId]);
  useEffect(() => { load(); }, [load]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImages((imgs) => [
          ...imgs,
          ...data.files.map((f: { id: string; url: string }) => ({ id: f.id, url: f.url })),
        ]);
      } else {
        alert(data.error ?? "No se pudo subir");
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id: string) =>
    setImages((imgs) => imgs.filter((i) => i.id !== id));

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const save = async () => {
    setSaving(true);
    const payload = {
      title: title || null,
      body: body || null,
      tags: tags.join(","),
      isPublished,
      images: images.map((i) => i.id),
    };
    try {
      const url = savedId ? `/api/posts/${savedId}` : "/api/posts";
      const method = savedId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (!savedId) {
          setSavedId(data.id);
          router.replace(`/admin/posts/${data.id}`);
        }
      } else {
        alert(data.error ?? "No se pudo guardar");
      }
    } finally {
      setSaving(false);
    }
  };

  const shareText = (body ? body : title ?? "") + "\n\n— LM Sport Gym, Karla Lizeth";
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/#posts" : "";
  const encText = encodeURIComponent(shareText);
  const encUrl = encodeURIComponent(shareUrl);

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encText}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;
  const whatsapp = `https://wa.me/?text=${encText}%20${encUrl}`;

  const copyCaption = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadFirstImage = async () => {
    if (images.length === 0) return;
    const r = await fetch(images[0].url);
    const blob = await r.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `lm-sport-${savedId ?? "post"}.jpg`;
    a.click();
    URL.revokeObjectURL(u);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-0 pb-24 space-y-6 animate-fade-in max-w-3xl mx-auto">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm"
      >
        <ArrowLeft size={14} /> Volver
      </Link>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {savedId ? "Editar publicación" : "Nueva publicación"}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Sube las fotos, escribe el texto y compártelo en redes.
        </p>
      </div>

      {/* Fotos */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Fotos
          </h2>
          <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-200 text-xs font-medium cursor-pointer transition">
            <ImagePlus size={14} />
            {uploading ? "Subiendo…" : "Añadir fotos"}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
        {images.length === 0 ? (
          <label
            className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] text-white/40 cursor-pointer hover:bg-white/[0.04] transition"
            htmlFor="dropzone"
          >
            <ImagePlus size={28} className="mb-2" />
            <span className="text-sm">Arrastra o selecciona fotos (jpg, png, hasta 10MB)</span>
            <input
              id="dropzone"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden bg-black/40 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white/90 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Texto */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">
            Título (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva clase de spinning sábado 7am"
            className="w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">
            Texto / caption
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Escribe aquí tu publicación. Este texto se copia cuando compartes en redes."
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition resize-none"
          />
          <div className="text-[11px] text-white/40 mt-1">{body.length} caracteres</div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5">
            Etiquetas
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`h-8 px-3 text-xs rounded-full border transition ${
                    on
                      ? "bg-orange-500/20 border-orange-500/40 text-orange-200"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.07]"
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-white/40 mt-2">
            Las fotos con etiqueta <code className="text-orange-300">#galeria</code> aparecen en la galería de la landing.
          </p>
        </div>
      </section>

      {/* Compartir en redes */}
      {savedId && (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
            <Share2 size={14} /> Compartir en redes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-sm font-medium transition"
            >
              <Facebook size={16} /> Facebook
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-500/90 text-white text-sm font-medium transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-neutral-900 hover:bg-black border border-white/10 text-white text-sm font-medium transition"
            >
              <Twitter size={16} /> X / Twitter
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-500 hover:opacity-90 text-white text-sm font-medium transition"
              title="Abre Instagram — IG no permite publicar desde web, copia la caption y sube la foto desde el celular"
            >
              <Instagram size={16} /> Instagram
            </a>
            <button
              onClick={copyCaption}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium transition border border-white/10"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? "Copiado" : "Copiar caption"}
            </button>
          </div>
          {images.length > 0 && (
            <div className="mt-3">
              <button
                onClick={downloadFirstImage}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs transition border border-white/10"
              >
                <Download size={13} /> Descargar foto para Instagram
              </button>
              <p className="text-[11px] text-white/40 mt-2">
                Instagram solo acepta publicaciones desde el celular. Descarga la foto, abre la app y pega la caption.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Barra sticky guardar */}
      <div className="sticky bottom-4 z-10">
        <div className="glass-strong rounded-2xl p-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium transition border ${
              isPublished
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
                : "bg-white/[0.04] border-white/10 text-white/60"
            }`}
          >
            {isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
            {isPublished ? "Publicada" : "Borrador"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-orange-500 text-white font-medium shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Guardando…" : savedId ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
