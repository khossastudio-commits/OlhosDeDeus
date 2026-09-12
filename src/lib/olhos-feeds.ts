import { MOZAMBIQUE } from '@/lib/mozambique';
import { firmsAreaUrl } from '@/lib/olhos-fire';

export type FeedStatus = 'live' | 'unavailable' | 'error';
export type FeedResult = { events: any[]; source: any | null; status: FeedStatus; meta?: Record<string, unknown> };

const B = MOZAMBIQUE.bounds;
const now = () => new Date().toISOString();
const source = (id: string, name: string, url: string, extra: Record<string, unknown> = {}) => ({ id, name, url, access: 'public', retrievedAt: now(), ...extra });

function inside(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= B.south && latitude <= B.north && longitude >= B.west && longitude <= B.east;
}

export async function getEarthquakes(): Promise<FeedResult> {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { next: { revalidate: 60 } });
    if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const feed = await response.json();
    const events = (feed.features ?? []).filter((f: any) => {
      const [longitude, latitude] = f.geometry?.coordinates ?? [];
      return inside(latitude, longitude);
    }).map((f: any) => {
      const mag = Number(f.properties?.mag);
      return {
        id: `usgs-${f.id}`, layer: 'earthquakes', title: `Sismo M${Number.isFinite(mag) ? mag : '?'}`,
        summary: f.properties?.place ?? 'Evento sísmico', severity: mag >= 5 ? 'warning' : 'info',
        observedAt: new Date(f.properties?.time ?? Date.now()).toISOString(),
        location: { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] }, confidence: 1,
        source: source('usgs-earthquakes', 'USGS Earthquakes', 'https://earthquake.usgs.gov/earthquakes/feed/'), tags: ['USGS', 'GeoJSON'],
      };
    });
    return { events, source: source('usgs-earthquakes', 'USGS Earthquakes', 'https://earthquake.usgs.gov/earthquakes/feed/'), status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export async function getWeather(): Promise<FeedResult> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(MOZAMBIQUE.center.latitude)); url.searchParams.set('longitude', String(MOZAMBIQUE.center.longitude));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m'); url.searchParams.set('timezone', 'Africa/Maputo');
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const data = await response.json(); const current = data.current;
    const event = current ? [{
      id: 'weather-national-center', layer: 'weather', title: 'Condições meteorológicas nacionais',
      summary: `${current.temperature_2m ?? '—'}°C · vento ${current.wind_speed_10m ?? '—'} km/h · rajada ${current.wind_gusts_10m ?? '—'} km/h`,
      severity: Number(current.wind_gusts_10m) >= 70 ? 'warning' : 'info', observedAt: current.time ?? now(),
      location: { latitude: MOZAMBIQUE.center.latitude, longitude: MOZAMBIQUE.center.longitude, region: 'Moçambique' }, confidence: 1,
      source: source('open-meteo', 'Open-Meteo', 'https://open-meteo.com/', { licenseOrTerms: 'CC BY 4.0' }), tags: ['weather', 'national-center'],
    }] : [];
    return { events: event, source: source('open-meteo', 'Open-Meteo', 'https://open-meteo.com/', { licenseOrTerms: 'CC BY 4.0' }), status: 'live', meta: { current } };
  } catch { return { events: [], source: null, status: 'error' }; }
}

function parseCsv(csv: string) {
  const lines = csv.trim().split(/\r?\n/); if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => { const values = line.split(','); return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ''])); });
}

export async function getFires(): Promise<FeedResult> {
  const key = process.env.FIRMS_API_KEY;
  if (!key) return { events: [], source: null, status: 'unavailable', meta: { reason: 'FIRMS_API_KEY is not configured' } };
  try {
    const response = await fetch(firmsAreaUrl(key), { next: { revalidate: 600 } });
    if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const rows = parseCsv(await response.text());
    const events = rows.map((row: Record<string, string>, index) => {
      const latitude = Number(row.latitude), longitude = Number(row.longitude), confidence = Number(row.confidence); const rawTime = String(row.acq_time ?? '0000').padStart(4, '0');
      return { id: `firms-${row.acq_date ?? 'unknown'}-${rawTime}-${index}`, layer: 'fires', title: 'Detecção de foco de calor', summary: `VIIRS · confiança ${Number.isFinite(confidence) ? confidence : '—'}`,
        severity: confidence >= 80 ? 'warning' : 'info', observedAt: `${row.acq_date ?? ''}T${rawTime.slice(0, 2)}:${rawTime.slice(2)}:00Z`, location: { latitude, longitude, region: MOZAMBIQUE.name },
        confidence: Number.isFinite(confidence) ? confidence / 100 : undefined, source: source('nasa-firms', 'NASA FIRMS', 'https://firms.modaps.eosdis.nasa.gov/', { licenseOrTerms: 'NASA FIRMS terms' }), tags: ['NASA', 'FIRMS', 'VIIRS'] };
    }).filter((e) => inside(e.location.latitude, e.location.longitude));
    return { events, source: source('nasa-firms', 'NASA FIRMS', 'https://firms.modaps.eosdis.nasa.gov/'), status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export async function getAviation(): Promise<FeedResult> {
  try {
    const url = new URL('https://opensky-network.org/api/states/all'); url.searchParams.set('lamin', String(B.south)); url.searchParams.set('lomin', String(B.west)); url.searchParams.set('lamax', String(B.north)); url.searchParams.set('lomax', String(B.east));
    const headers: HeadersInit = {};
    if (process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET) {
      const tokenResponse = await fetch('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.OPENSKY_CLIENT_ID, client_secret: process.env.OPENSKY_CLIENT_SECRET }), cache: 'no-store' });
      if (tokenResponse.ok) { const token = await tokenResponse.json(); headers.Authorization = `Bearer ${token.access_token}`; }
    }
    const response = await fetch(url, { headers, next: { revalidate: 30 } }); if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const data = await response.json();
    const events = (data.states ?? []).filter((s: any[]) => Number.isFinite(s[5]) && Number.isFinite(s[6])).slice(0, 500).map((s: any[]) => ({
      id: `opensky-${s[0]}`, layer: 'aviation', title: String(s[1] ?? s[0] ?? 'Aeronave').trim() || 'Aeronave', summary: `Alt ${Math.round(Number(s[13] ?? 0))} m · ${Math.round(Number(s[9] ?? 0) * 3.6)} km/h`, severity: 'info',
      observedAt: new Date((Number(data.time ?? Date.now() / 1000)) * 1000).toISOString(), location: { latitude: Number(s[6]), longitude: Number(s[5]) }, confidence: 1,
      source: source('opensky', 'OpenSky Network', 'https://opensky-network.org/data/api/'), tags: ['aviation', 'ADS-B'], metadata: { icao24: s[0], callsign: s[1], velocityMs: s[9], heading: s[10], altitudeM: s[13] },
    }));
    return { events, source: source('opensky', 'OpenSky Network', 'https://opensky-network.org/data/api/'), status: 'live', meta: { timestamp: data.time } };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export async function getDisasters(): Promise<FeedResult> {
  try {
    const url = new URL('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH'); url.searchParams.set('eventlist', 'EQ;TC;FL;WF');
    url.searchParams.set('fromdate', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)); url.searchParams.set('todate', new Date().toISOString().slice(0, 10)); url.searchParams.set('alertlevel', 'red;orange;green');
    const response = await fetch(url, { next: { revalidate: 360 } }); if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const data = await response.json(); const features = Array.isArray(data?.features) ? data.features : [];
    const events = features.map((f: any, index: number) => { const coords = f.geometry?.coordinates ?? []; const longitude = Number(coords[0]), latitude = Number(coords[1]); const p = f.properties ?? {}; return { f, longitude, latitude, p, index }; })
      .filter((x: any) => inside(x.latitude, x.longitude)).map((x: any) => ({
        id: `gdacs-${x.p.eventid ?? x.p.eventId ?? x.index}`, layer: 'disasters', title: String(x.p.name ?? x.p.eventname ?? x.p.eventtype ?? 'Alerta de desastre'), summary: `GDACS · ${String(x.p.alertlevel ?? x.p.alertLevel ?? 'sem nível')}`,
        severity: String(x.p.alertlevel ?? x.p.alertLevel ?? '').toLowerCase() === 'red' ? 'critical' : String(x.p.alertlevel ?? x.p.alertLevel ?? '').toLowerCase() === 'orange' ? 'warning' : 'watch', observedAt: new Date(x.p.fromdate ?? x.p.fromDate ?? Date.now()).toISOString(),
        location: { latitude: x.latitude, longitude: x.longitude }, confidence: 1, source: source('gdacs', 'GDACS', 'https://www.gdacs.org/', { licenseOrTerms: 'GDACS terms of use' }), tags: ['GDACS', 'disaster'],
      }));
    return { events, source: source('gdacs', 'GDACS', 'https://www.gdacs.org/'), status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export async function getNews(): Promise<FeedResult> {
  try {
    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc'); url.searchParams.set('query', '(Mozambique OR Moçambique)'); url.searchParams.set('mode', 'artlist'); url.searchParams.set('format', 'json'); url.searchParams.set('maxrecords', '25'); url.searchParams.set('timespan', '24h'); url.searchParams.set('sort', 'datedesc');
    const response = await fetch(url, { next: { revalidate: 300 } }); if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const data = await response.json();
    const events = (data.articles ?? []).map((a: any, index: number) => {
      const stamp = String(a.seendate ?? ''); const observedAt = /^\d{14}$/.test(stamp) ? `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(8, 10)}:${stamp.slice(10, 12)}:${stamp.slice(12, 14)}Z` : now();
      return { id: `gdelt-${a.url ?? index}`, layer: 'news', title: String(a.title ?? 'Notícia sobre Moçambique'), summary: String(a.domain ?? a.sourcecountry ?? 'Fonte pública'), severity: 'info', observedAt,
        source: source('gdelt', 'GDELT Project', 'https://www.gdeltproject.org/'), tags: ['news', 'OSINT'], metadata: { url: a.url, domain: a.domain, language: a.language } };
    });
    return { events, source: source('gdelt', 'GDELT Project', 'https://www.gdeltproject.org/'), status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export function getOptionalFeedStatus() {
  return { maritime: process.env.AISSTREAM_API_KEY ? 'configured' : 'not_configured', satellites: process.env.N2YO_API_KEY ? 'configured' : 'not_configured', cameras: process.env.PUBLIC_CAMERA_FEED_URL ? 'configured' : 'authorized_feed_required' };
}
