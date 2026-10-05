export type PickupLocation = { latitude: number; longitude: number };

const LOCATION_TIMEOUT_MS = 7_000;
const LOCATION_DEADLINE_MS = 8_000;
// Coarse area estimates are not useful pickup pins; let the customer share a location instead.
const MAX_LOCATION_ACCURACY_METRES = 500;

/** Accept only an explicitly configured WhatsApp phone link, never an arbitrary redirect. */
export function getWhatsAppDestination(href: string | null): string | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
    let phone: string | undefined;
    if (url.hostname === 'wa.me') {
      phone = url.pathname.match(/^\/([1-9]\d{6,14})\/?$/)?.[1];
    } else if (url.hostname === 'api.whatsapp.com' && /^\/send\/?$/.test(url.pathname)) {
      const values = url.searchParams.getAll('phone');
      if (values.length === 1 && /^[1-9]\d{6,14}$/.test(values[0])) phone = values[0];
    }
    return phone ? `https://wa.me/${phone}` : null;
  } catch {
    return null;
  }
}

function isUsableLocation(location: PickupLocation): boolean {
  return Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90
    && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}

/** One request only; the separate deadline also bounds time spent at a permission prompt. */
export function getPickupLocation(geolocation?: Pick<Geolocation, 'getCurrentPosition'>): Promise<PickupLocation | null> {
  if (!geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (location: PickupLocation | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(location);
    };
    const deadline = setTimeout(() => finish(null), LOCATION_DEADLINE_MS);
    try {
      geolocation.getCurrentPosition(
        ({ coords }) => {
          const location = { latitude: coords.latitude, longitude: coords.longitude };
          const usableAccuracy = Number.isFinite(coords.accuracy)
            && coords.accuracy >= 0 && coords.accuracy <= MAX_LOCATION_ACCURACY_METRES;
          finish(isUsableLocation(location) && usableAccuracy ? location : null);
        },
        () => finish(null),
        { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 0 },
      );
    } catch {
      finish(null);
    }
  });
}

/** Coordinates exist only in this draft URL; no storage, network request or analytics here. */
export function buildWhatsAppRecoveryUrl(destination: string, location: PickupLocation | null = null): string {
  let pickup = '';
  if (location && isUsableLocation(location)) {
    const maps = new URL('https://www.google.com/maps/search/');
    maps.searchParams.set('api', '1');
    maps.searchParams.set('query', `${location.latitude},${location.longitude}`);
    pickup = `\n${maps.toString()}`;
  }
  const message = `Hi Teleport Recovery, I need vehicle recovery.\n\nPickup:${pickup}\n\nDestination:\n\nVehicle / reg:\n\nWhat happened:`;
  const url = new URL(destination);
  url.searchParams.set('text', message);
  return url.toString();
}
