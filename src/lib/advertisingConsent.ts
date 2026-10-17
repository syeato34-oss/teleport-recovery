import { businessConfig } from '../config/business';

export const CONSENT_STORAGE_KEY = 'teleport-advertising-consent';
export const CONSENT_VERSION = 1;
export const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;
export const PRIVACY_SETTINGS_EVENT = 'teleport:privacy-settings';
export const GOOGLE_ADS_ID = 'AW-18493914811';
export const WEBSITE_CALL_ID = 'AW-18493914811/BRTACI7HpZUdELv9yvJE';
export type ConsentChoice = 'accepted' | 'rejected';
type ConsentRecord = { version: number; choice: ConsentChoice; updatedAt: number };
type GoogleWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function parseConsent(value: string | null, now = Date.now()): ConsentRecord | null {
  try {
    const record = JSON.parse(value ?? 'null');
    return record?.version === CONSENT_VERSION
      && ['accepted', 'rejected'].includes(record.choice)
      && typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt)
      && record.updatedAt <= now && now - record.updatedAt < CONSENT_LIFETIME_MS
      ? record : null;
  } catch { return null; }
}

function readConsent(): ConsentRecord | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    const saved = parseConsent(value);
    // Do not restore an old acceptance if the browser cannot save a later withdrawal.
    if (saved?.choice === 'accepted') window.localStorage.setItem(CONSENT_STORAGE_KEY, value!);
    return saved;
  }
  catch { return null; }
}

let record = typeof window === 'undefined' ? null : readConsent();
let started = false;
let tagLoaded = false;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };

export function getAdvertisingChoice(): ConsentChoice | null {
  return record && parseConsent(JSON.stringify(record)) ? record.choice : null;
}

export function subscribeAdvertisingConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Basic mode: the Google library and its commands exist only after affirmative consent. */
function loadAdvertising(): void {
  if (tagLoaded || getAdvertisingChoice() !== 'accepted') return;
  tagLoaded = true;
  const googleWindow = window as GoogleWindow;
  googleWindow.dataLayer ??= [];
  // Google's command queue uses Arguments objects, rather than ordinary event arrays.
  // eslint-disable-next-line prefer-rest-params
  const gtag: (...args: unknown[]) => void = function () { googleWindow.dataLayer!.push(arguments); };
  googleWindow.gtag = gtag;
  gtag('consent', 'default', denied);
  gtag('consent', 'update', { ...denied, ad_storage: 'granted', ad_user_data: 'granted' });
  gtag('set', { allow_ad_personalization_signals: false, allow_google_signals: false, ads_data_redaction: true });
  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID, { allow_ad_personalization_signals: false, allow_google_signals: false });
  gtag('config', WEBSITE_CALL_ID, { phone_conversion_number: businessConfig.phoneDisplay });
  const script = document.createElement('script');
  script.id = 'teleport-google-ads';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(script);
}

/** Remove readable first-party Ads cookies; third-party cookies are controlled by the browser. */
function clearAdvertisingCookies(): void {
  const domains = window.location.hostname.split('.');
  const scopes = ['', ...domains.map((_, index) => domains.slice(index).join('.')).filter((domain) => domain.includes('.'))];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (!/^(?:_gcl_|_gac_|gwcc$|FPGCL|FPAU$)/.test(name)) continue;
    for (const domain of scopes) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax`;
  }
}

function notify(): void { listeners.forEach((listener) => listener()); }

function applyConsent(next: ConsentRecord | null): void {
  const wasLoaded = tagLoaded;
  record = next;
  clearTimeout(expiryTimer);
  notify();
  if (getAdvertisingChoice() === 'accepted') {
    loadAdvertising();
    // Avoid the browser's 32-bit timeout overflow for a six-month preference.
    expiryTimer = setTimeout(() => applyConsent(readConsent()), Math.min(CONSENT_LIFETIME_MS - (Date.now() - record!.updatedAt), 2_147_483_647));
  } else {
    clearAdvertisingCookies();
    if (wasLoaded) {
      (window as GoogleWindow).gtag?.('consent', 'update', denied);
      // Removing a script element cannot unload its listeners/timers. A fresh document
      // guarantees basic-mode blocking instead of leaving cookieless tracking running.
      window.location.reload();
    }
  }
}

/** False means storage failed; an unsaved acceptance never enables advertising. */
export function saveAdvertisingChoice(choice: ConsentChoice): boolean {
  const next = { version: CONSENT_VERSION, choice, updatedAt: Date.now() };
  try { window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next)); }
  catch {
    if (choice === 'accepted') return false;
    try { window.localStorage.removeItem(CONSENT_STORAGE_KEY); } catch { /* Fail closed on this document. */ }
  }
  applyConsent(next);
  return true;
}

/** Called after React mounts; StrictMode and repeated preference saves cannot duplicate tags. */
export function startAdvertisingConsent(): void {
  if (started) return;
  started = true;
  applyConsent(record);
  window.addEventListener('storage', (event) => {
    if (event.key === CONSENT_STORAGE_KEY || event.key === null) applyConsent(readConsent());
  });
  window.addEventListener('pageshow', () => applyConsent(readConsent()));
  window.addEventListener('focus', () => {
    if (record && !getAdvertisingChoice()) applyConsent(null);
  });
}

export function openAdvertisingSettings(): void {
  window.dispatchEvent(new Event(PRIVACY_SETTINGS_EVENT));
}
