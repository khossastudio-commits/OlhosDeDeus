/**
 * National configuration for OLHOS DE DEUS.
 *
 * This file contains geographic presentation defaults only. It must never be
 * treated as a source of sensitive or private intelligence.
 */
export const MOZAMBIQUE = {
  name: "Moçambique",
  countryCode: "MZ",
  center: { latitude: -18.6657, longitude: 35.5296 },
  bounds: {
    west: 30.2,
    south: -26.9,
    east: 41.9,
    north: -10.3,
  },
  defaultZoom: 4.2,
} as const;

export const OLHOS_LAYERS = [
  { id: "alerts", label: "Alertas", priority: 1 },
  { id: "weather", label: "Clima", priority: 2 },
  { id: "disasters", label: "Desastres", priority: 3 },
  { id: "fires", label: "Incêndios", priority: 4 },
  { id: "earthquakes", label: "Sismos", priority: 5 },
  { id: "aviation", label: "Aviação", priority: 6 },
  { id: "maritime", label: "Marítimo", priority: 7 },
  { id: "cameras", label: "Câmaras públicas", priority: 8 },
  { id: "news", label: "Notícias", priority: 9 },
  { id: "satellites", label: "Satélites", priority: 10 },
] as const;

export type OlhosLayerId = (typeof OLHOS_LAYERS)[number]["id"];

/**
 * Product rule: OLHOS DE DEUS only displays public or explicitly authorized
 * data. A source should carry provenance, retrieval time and licensing/usage
 * information before it is promoted to a production layer.
 */
export const DATA_GOVERNANCE = {
  allowed: [
    "public APIs",
    "open government datasets",
    "public broadcasts and webcams",
    "public satellite and weather feeds",
    "authorized institutional feeds",
  ],
  requiredMetadata: ["source", "retrievedAt", "licenseOrTerms"],
  prohibited: [
    "private accounts",
    "leaked credentials",
    "unauthorized camera access",
    "non-public personal data",
    "unauthorized network intrusion",
  ],
} as const;
