/**
 * OLHOS DE DEUS — common intelligence/event contract.
 *
 * The UI may aggregate many public/authorized feeds, but every normalized
 * event must retain provenance so operators can distinguish observation from
 * interpretation.
 */

import type { OlhosLayerId } from '@/lib/mozambique';

export type IntelligenceSeverity = 'info' | 'watch' | 'warning' | 'critical';
export type SourceAccess = 'public' | 'authorized';

export interface IntelligenceSource {
  id: string;
  name: string;
  url?: string;
  access: SourceAccess;
  licenseOrTerms?: string;
  retrievedAt: string;
}

export interface IntelligenceEvent {
  id: string;
  layer: OlhosLayerId;
  title: string;
  summary?: string;
  severity: IntelligenceSeverity;
  observedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    region?: string;
  };
  source: IntelligenceSource;
  confidence?: number;
  tags?: string[];
}

export interface NationalSituationSnapshot {
  country: 'MZ';
  generatedAt: string;
  events: IntelligenceEvent[];
  activeLayers: OlhosLayerId[];
}

export function isTrustedEvent(event: IntelligenceEvent): boolean {
  return (
    Boolean(event.source.id) &&
    Boolean(event.source.name) &&
    Boolean(event.source.retrievedAt) &&
    (event.source.access === 'public' || event.source.access === 'authorized')
  );
}

export function severityRank(severity: IntelligenceSeverity): number {
  return { info: 0, watch: 1, warning: 2, critical: 3 }[severity];
}

export function sortByOperationalPriority(events: IntelligenceEvent[]): IntelligenceEvent[] {
  return [...events].sort((a, b) => {
    const severity = severityRank(b.severity) - severityRank(a.severity);
    if (severity !== 0) return severity;
    return Date.parse(b.observedAt) - Date.parse(a.observedAt);
  });
}
