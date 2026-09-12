'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CloudRain, Flame, Radio, Satellite, Ship, Plane, Newspaper, ShieldCheck, Database, Crosshair, RefreshCw, X } from 'lucide-react';
import { MOZAMBIQUE, OLHOS_LAYERS, type OlhosLayerId } from '@/lib/mozambique';

const OsirisMap = dynamic(() => import('@/components/OsirisMap'), { ssr: false });

const ICONS: Record<OlhosLayerId, typeof Activity> = {
  alerts: AlertTriangle,
  weather: CloudRain,
  disasters: Activity,
  fires: Flame,
  earthquakes: Activity,
  aviation: Plane,
  maritime: Ship,
  cameras: Radio,
  news: Newspaper,
  satellites: Satellite,
};

type IntelEvent = {
  id: string;
  layer: OlhosLayerId;
  title: string;
  summary?: string;
  severity: string;
  observedAt: string;
  location?: { latitude: number; longitude: number; region?: string };
  source?: { name?: string; url?: string; retrievedAt?: string };
};

type Overview = {
  generatedAt: string;
  events: IntelEvent[];
  counts: Record<string, number>;
  health?: { status?: string; feeds?: Record<string, string> };
};

export default function OlhosCommandCenter() {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, true])),
  );
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IntelEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/olhos/overview', { cache: 'no-store' });
      if (!response.ok) throw new Error('overview unavailable');
      setOverview(await response.json());
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
    const timer = window.setInterval(() => void loadOverview(), 60_000);
    return () => window.clearInterval(timer);
  }, [loadOverview]);

  const mapData = useMemo(() => ({}), []);
  const flyToMozambique = useMemo(() => ({
    lat: MOZAMBIQUE.center.latitude,
    lng: MOZAMBIQUE.center.longitude,
    zoom: MOZAMBIQUE.defaultZoom,
    ts: 1,
  }), []);

  const toggleLayer = (id: OlhosLayerId) => {
    setActiveLayers((current) => ({ ...current, [id]: !current[id] }));
  };

  const status = overview?.health?.status ?? (loading ? 'syncing' : 'degraded');
  const statusLabel = status === 'live' ? 'LIVE' : status === 'syncing' ? 'SYNCING' : 'DEGRADED';
  const statusClass = status === 'live' ? 'text-emerald-300' : status === 'syncing' ? 'text-yellow-300' : 'text-orange-300';
  const visibleEvents = (overview?.events ?? []).filter((event) => activeLayers[event.layer]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05070a] text-white font-mono">
      <div className="absolute inset-0">
        <OsirisMap
          data={mapData}
          activeLayers={activeLayers}
          projection="globe"
          flyToLocation={flyToMozambique}
          theme="core"
        />
      </div>

      <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="m-3 flex items-start justify-between gap-3">
          <section className="pointer-events-auto rounded-lg border border-white/10 bg-[#070a0f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-[var(--gold-primary)]" />
              <span className="text-xs font-bold tracking-[0.28em] text-[var(--gold-primary)]">OLHOS DE DEUS</span>
            </div>
            <div className="mt-1 text-[10px] tracking-[0.18em] text-white/50">NATIONAL SITUATION AWARENESS</div>
            <div className={`mt-2 flex items-center gap-2 text-[9px] ${statusClass}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusLabel} · PUBLIC / AUTHORIZED DATA
            </div>
          </section>

          <section className="pointer-events-auto hidden md:block rounded-lg border border-white/10 bg-[#070a0f]/90 px-4 py-3 text-right backdrop-blur-xl">
            <div className="text-[9px] tracking-[0.2em] text-white/40">AREA OF OPERATIONS</div>
            <div className="mt-1 text-sm font-bold tracking-[0.15em]">MOÇAMBIQUE · MZ</div>
            <div className="mt-1 text-[9px] text-white/40">{MOZAMBIQUE.center.latitude.toFixed(4)} / {MOZAMBIQUE.center.longitude.toFixed(4)}</div>
          </section>
        </div>
      </header>

      <aside className="absolute left-3 top-28 z-20 w-56 max-w-[calc(100vw-24px)] rounded-lg border border-white/10 bg-[#070a0f]/90 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/60">NATIONAL LAYERS</span>
          <Database className="h-3.5 w-3.5 text-white/30" />
        </div>
        <div className="space-y-1">
          {OLHOS_LAYERS.map((layer) => {
            const Icon = ICONS[layer.id];
            const enabled = Boolean(activeLayers[layer.id]);
            const count = overview?.counts?.[layer.id] ?? 0;
            return (
              <button key={layer.id} type="button" onClick={() => toggleLayer(layer.id)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[9px] tracking-wide transition ${enabled ? 'bg-white/[0.07] text-white' : 'text-white/30 hover:bg-white/[0.04]'}`}>
                <span className="flex items-center gap-2"><Icon className="h-3 w-3" />{layer.label}</span>
                <span className="flex items-center gap-2"><span className="text-white/35">{count}</span><span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-white/20'}`} /></span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => void loadOverview()} className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-white/10 px-2 py-2 text-[8px] tracking-[0.15em] text-white/50 hover:bg-white/5">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH INTELLIGENCE
        </button>
      </aside>

      <aside className="absolute right-3 top-28 z-20 w-72 max-w-[calc(100vw-24px)] rounded-lg border border-white/10 bg-[#070a0f]/90 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/60">SITUATION</span>
          <Activity className="h-3.5 w-3.5 text-[var(--cyan-primary)]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded border border-white/[0.06] bg-white/[0.025] p-2"><div className="text-[8px] text-white/35">EVENTS</div><div className="mt-1 text-sm font-bold">{overview?.counts?.total ?? '—'}</div></div>
          <div className="rounded border border-white/[0.06] bg-white/[0.025] p-2"><div className="text-[8px] text-white/35">FEEDS</div><div className="mt-1 text-sm font-bold">{Object.values(overview?.health?.feeds ?? {}).filter((v) => v === 'live').length}</div></div>
          <div className="rounded border border-white/[0.06] bg-white/[0.025] p-2"><div className="text-[8px] text-white/35">STATUS</div><div className={`mt-1 text-[10px] font-bold ${statusClass}`}>{statusLabel}</div></div>
        </div>

        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {visibleEvents.length === 0 ? (
            <div className="rounded border border-white/[0.06] p-3 text-[8px] leading-relaxed text-white/35">No verified events are currently available for the active layers.</div>
          ) : visibleEvents.map((event) => (
            <button key={event.id} type="button" onClick={() => setSelectedEvent(event)} className="w-full rounded border border-white/[0.06] bg-white/[0.025] p-2 text-left hover:bg-white/[0.06]">
              <div className="flex items-center justify-between gap-2"><span className="truncate text-[9px] font-bold text-white/80">{event.title}</span><span className="text-[7px] uppercase text-white/30">{event.layer}</span></div>
              {event.summary && <div className="mt-1 text-[8px] text-white/40">{event.summary}</div>}
            </button>
          ))}
        </div>
      </aside>

      {selectedEvent && (
        <aside className="absolute bottom-14 right-3 z-40 w-80 max-w-[calc(100vw-24px)] rounded-lg border border-white/10 bg-[#070a0f]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3"><div><div className="text-[8px] tracking-[0.2em] text-white/35">EVENT DETAIL</div><h2 className="mt-1 text-sm font-bold">{selectedEvent.title}</h2></div><button type="button" onClick={() => setSelectedEvent(null)}><X className="h-4 w-4 text-white/40" /></button></div>
          {selectedEvent.summary && <p className="mt-3 text-[9px] leading-relaxed text-white/55">{selectedEvent.summary}</p>}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] text-white/40">
            <div>SEVERITY<br /><strong className="text-white/70">{selectedEvent.severity.toUpperCase()}</strong></div>
            <div>SOURCE<br /><strong className="text-white/70">{selectedEvent.source?.name ?? 'Unknown'}</strong></div>
            <div>OBSERVED<br /><strong className="text-white/70">{new Date(selectedEvent.observedAt).toLocaleString('pt-PT')}</strong></div>
            <div>LOCATION<br /><strong className="text-white/70">{selectedEvent.location ? `${selectedEvent.location.latitude.toFixed(2)}, ${selectedEvent.location.longitude.toFixed(2)}` : '—'}</strong></div>
          </div>
        </aside>
      )}

      <footer className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 text-[8px] tracking-[0.14em] text-white/35">
        <div className="flex items-center gap-3 rounded border border-white/10 bg-[#070a0f]/85 px-3 py-2 backdrop-blur-xl"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" /><span>SOURCE GOVERNANCE: PUBLIC + AUTHORIZED</span></div>
        <div className="hidden items-center gap-3 rounded border border-white/10 bg-[#070a0f]/85 px-3 py-2 backdrop-blur-xl md:flex"><span>LAST SYNC: {overview ? new Date(overview.generatedAt).toLocaleTimeString('pt-PT') : '—'}</span><span className="text-white/15">|</span><span>OBSERVATION ≠ INTERPRETATION</span></div>
      </footer>
    </main>
  );
}
