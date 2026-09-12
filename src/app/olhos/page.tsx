'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CloudRain, Flame, Radio, Satellite, Ship, Plane, Newspaper, ShieldCheck, Database, Crosshair } from 'lucide-react';
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

export default function OlhosCommandCenter() {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, true])),
  );

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
            <div className="mt-2 flex items-center gap-2 text-[9px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]" />
              PUBLIC / AUTHORIZED DATA MODE
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
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[9px] tracking-wide transition ${enabled ? 'bg-white/[0.07] text-white' : 'text-white/30 hover:bg-white/[0.04]'}`}
              >
                <span className="flex items-center gap-2"><Icon className="h-3 w-3" />{layer.label}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
              </button>
            );
          })}
        </div>
      </aside>

      <aside className="absolute right-3 top-28 z-20 hidden w-64 rounded-lg border border-white/10 bg-[#070a0f]/90 p-3 shadow-2xl backdrop-blur-xl lg:block">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/60">SITUATION</span>
          <Activity className="h-3.5 w-3.5 text-[var(--cyan-primary)]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['ALERTS', '—'],
            ['WEATHER', '—'],
            ['FIRES', '—'],
            ['FLOODS', '—'],
            ['AVIATION', '—'],
            ['MARITIME', '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-white/[0.06] bg-white/[0.025] p-2">
              <div className="text-[8px] text-white/35">{label}</div>
              <div className="mt-1 text-sm font-bold text-white/80">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded border border-emerald-400/10 bg-emerald-400/[0.03] p-2 text-[8px] leading-relaxed text-white/40">
          Live national feeds are intentionally empty until a source adapter is registered with provenance and usage terms.
        </div>
      </aside>

      <footer className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 text-[8px] tracking-[0.14em] text-white/35">
        <div className="flex items-center gap-3 rounded border border-white/10 bg-[#070a0f]/85 px-3 py-2 backdrop-blur-xl">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
          <span>SOURCE GOVERNANCE: PUBLIC + AUTHORIZED</span>
        </div>
        <div className="hidden items-center gap-3 rounded border border-white/10 bg-[#070a0f]/85 px-3 py-2 backdrop-blur-xl md:flex">
          <span>VERIFICATION REQUIRED</span>
          <span className="text-white/15">|</span>
          <span>OBSERVATION ≠ INTERPRETATION</span>
        </div>
      </footer>
    </main>
  );
}
