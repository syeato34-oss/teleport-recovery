import { businessConfig } from '../config/business';

type PhoneNumber = Readonly<{ display: string; href: string }>;
const fallback: PhoneNumber = { display: businessConfig.phoneDisplay, href: businessConfig.phoneHref };
let current = fallback;
const listeners = new Set<() => void>();

// Google supplies the number; never infer forwarding eligibility from a URL or click.
function internationalNumber(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40 || !/^\+?[\d ()-]+$/.test(value.trim())) return null;
  const digits = value.replace(/\D/g, '');
  if (value.trim().startsWith('+')) return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
  if (/^0\d{9,10}$/.test(digits)) return `+44${digits.slice(1)}`;
  return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
}

function publish(next: PhoneNumber): void {
  if (next.display === current.display && next.href === current.href) return;
  current = next;
  listeners.forEach((listener) => listener());
}

export function resetPhoneNumber(): void { publish(fallback); }
export function getPhoneNumber(): PhoneNumber { return current; }
export function getFallbackPhoneNumber(): PhoneNumber { return fallback; }
export function subscribePhoneNumber(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Both callback arguments must describe the same dialable number. Fail safely. */
export function applyGooglePhoneNumber(formatted: unknown, dialable: unknown): void {
  const number = internationalNumber(dialable);
  if (!number || internationalNumber(formatted) !== number) { resetPhoneNumber(); return; }
  publish({ display: (formatted as string).trim(), href: `tel:${number}` });
}
