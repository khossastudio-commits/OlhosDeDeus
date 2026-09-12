import type { OlhosLayerId } from '@/lib/mozambique';
import type { SourceAccess } from '@/lib/olhos-intelligence';

export interface OlhosSourceDefinition {
  id: string;
  name: string;
  layer: OlhosLayerId;
  access: SourceAccess;
  description: string;
  url?: string;
  enabled: boolean;
}

/**
 * Registry of candidate public/authorized feeds.
 * A source is not considered live merely because it exists in this registry.
 * Adapters must validate freshness, licensing/terms and schema before events
 * are promoted into the national situation snapshot.
 */
export const OLHOS_SOURCE_REGISTRY: OlhosSourceDefinition[] = [
  {
    id: 'open-weather',
    name: 'Public weather feeds',
    layer: 'weather',
    access: 'public',
    description: 'Meteorological observations and forecasts exposed through public APIs.',
    enabled: false,
  },
  {
    id: 'public-disaster-feeds',
    name: 'Public disaster feeds',
    layer: 'disasters',
    access: 'public',
    description: 'Publicly published earthquake, flood, wildfire and disaster observations.',
    enabled: false,
  },
  {
    id: 'public-aviation',
    name: 'Public aviation data',
    layer: 'aviation',
    access: 'public',
    description: 'Aircraft and airport information available under the source terms.',
    enabled: false,
  },
  {
    id: 'public-maritime',
    name: 'Public maritime data',
    layer: 'maritime',
    access: 'public',
    description: 'Public vessel information where the provider permits aggregation.',
    enabled: false,
  },
  {
    id: 'public-cameras',
    name: 'Public cameras and webcams',
    layer: 'cameras',
    access: 'public',
    description: 'Only cameras intentionally exposed to the public by their operators.',
    enabled: false,
  },
  {
    id: 'institutional-feeds',
    name: 'Authorized institutional feeds',
    layer: 'alerts',
    access: 'authorized',
    description: 'Future government or institutional feeds connected under explicit authorization.',
    enabled: false,
  },
];
