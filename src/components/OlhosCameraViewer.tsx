'use client';

import { useEffect, useState } from 'react';
import { Camera, ExternalLink, Maximize2, MapPin, RefreshCw, X } from 'lucide-react';

type CameraData = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city?: string;
  country?: string;
  source?: string;
  feed_url?: string;
  stream_url?: string;
  stream_type?: string;
  external_url?: string;
  publisher?: string;
};

export default function OlhosCameraViewer({ camera, onClose, onLocate }: { camera: CameraData | null; onClose: () => void; onLocate?: (lat: number, lng: number) => void }) {
  const [refresh, setRefresh] = useState(Date.now());
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!camera) return;
    const isImage = camera.stream_type === 'jpg' || (!camera.stream_type && Boolean(camera.feed_url));
    if (!isImage) return;
    const timer = window.setInterval(() => setRefresh(Date.now()), 5000);
    return () => window.clearInterval(timer);
  }, [camera]);

  if (!camera) return null;

  const imageUrl = camera.feed_url ? `${camera.feed_url}${camera.feed_url.includes('?') ? '&' : '?'}_t=${refresh}` : null;
  const videoUrl = camera.stream_url || null;
  const externalUrl = camera.external_url || camera.feed_url || camera.stream_url;
  const type = camera.stream_type || (camera.feed_url ? 'jpg' : 'external');

  return (
    <div className={`fixed z-[600] ${fullscreen ? 'inset-2 md:inset-4' : 'bottom-16 left-2 right-2 md:bottom-6 md:right-6 md:left-auto md:w-[520px]'} overflow-hidden rounded-lg border border-white/10 bg-[#05070a]/95 shadow-2xl backdrop-blur-xl`}>
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Camera className="h-4 w-4 shrink-0 text-[var(--gold-primary)]" />
          <div className="min-w-0">
            <div className="truncate text-[10px] font-bold tracking-[0.14em] text-white">{camera.name}</div>
            <div className="truncate text-[8px] text-white/40">{camera.city}{camera.country ? ` · ${camera.country}` : ''} · {camera.source || 'PUBLIC SOURCE'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {type === 'jpg' && <button type="button" onClick={() => setRefresh(Date.now())} className="rounded border border-white/10 p-1.5 text-white/50 hover:bg-white/10" title="Actualizar"><RefreshCw className="h-3 w-3" /></button>}
          <button type="button" onClick={() => onLocate?.(camera.lat, camera.lng)} className="rounded border border-white/10 p-1.5 text-white/50 hover:bg-white/10" title="Localizar"><MapPin className="h-3 w-3" /></button>
          <button type="button" onClick={() => setFullscreen((value) => !value)} className="hidden rounded border border-white/10 p-1.5 text-white/50 hover:bg-white/10 md:block" title="Ecrã inteiro"><Maximize2 className="h-3 w-3" /></button>
          <button type="button" onClick={onClose} className="ml-1 rounded border border-red-500/20 p-1.5 text-red-300 hover:bg-red-500/10" title="Fechar"><X className="h-3 w-3" /></button>
        </div>
      </div>

      <div className={`${fullscreen ? 'h-[calc(100%-54px)]' : 'aspect-video'} relative bg-black`}>
        {type === 'jpg' && imageUrl ? (
          <img src={imageUrl} alt={`Feed público: ${camera.name}`} className="h-full w-full object-contain" />
        ) : type === 'iframe' && videoUrl ? (
          <iframe src={videoUrl} title={camera.name} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : type === 'mp4' && videoUrl ? (
          <video src={videoUrl} className="h-full w-full object-contain" autoPlay muted controls playsInline />
        ) : videoUrl ? (
          <video src={videoUrl} className="h-full w-full object-contain" autoPlay muted controls playsInline />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <Camera className="h-6 w-6 text-white/20" />
            <div className="text-[9px] tracking-[0.16em] text-white/40">FEED NÃO EMBUTÍVEL</div>
            {externalUrl && <a href={externalUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 rounded border border-cyan-400/20 px-3 py-2 text-[8px] tracking-[0.12em] text-cyan-300 hover:bg-cyan-400/10"><ExternalLink className="h-3 w-3" /> ABRIR NA FONTE ORIGINAL</a>}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 border border-white/5" />
        <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[7px] tracking-[0.14em] text-emerald-300">● PUBLIC FEED · LIVE VIEW</div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[7px] tracking-[0.12em] text-white/35">
        <span>{camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}</span>
        <span>{camera.publisher ? `PUBLISHER: ${camera.publisher}` : 'SOURCE: PUBLIC / AUTHORIZED'}</span>
      </div>
    </div>
  );
}
