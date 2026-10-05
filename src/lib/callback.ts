export const CALLBACK_FORM_NAME = 'recovery-callback';
export const CALLBACK_ENDPOINT = '/__forms/callback.html';
const CALLBACK_TIMEOUT_MS = 15_000;

/** Accept familiar phone formatting without restricting callers to UK numbers. */
export function isCallbackPhoneValid(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return /^\+?[0-9 ().-]+$/.test(trimmed) && digits.length >= 7 && digits.length <= 15;
}

/**
 * The static Netlify form blueprint must use these same field names.
 * Netlify handles URL-encoded POSTs before serving the endpoint's static page.
 */
export async function submitCallback(
  formData: FormData,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const body = new URLSearchParams({ 'form-name': CALLBACK_FORM_NAME });
  for (const field of ['name', 'phone', 'location', 'details', 'bot-field']) {
    const value = formData.get(field);
    body.set(field, typeof value === 'string' ? value.trim() : '');
  }

  // Also reject a filled honeypot here: Netlify can silently discard bot requests.
  if (body.get('bot-field')) {
    throw new Error('Callback request could not be confirmed.');
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), CALLBACK_TIMEOUT_MS);

  try {
    const response = await fetcher(CALLBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('Callback request could not be confirmed.');
    }

    const responseBody = await response.text();
    // A Vite/SPA fallback or the unprocessed static endpoint can return HTTP 200.
    // Neither is evidence that Netlify Forms accepted a callback request.
    if (
      /data-callback-unprocessed/i.test(responseBody) ||
      /id\s*=\s*["']root["']/i.test(responseBody) ||
      /(?:\/src\/main\.[jt]sx?|\/assets\/index-[^"'\s]+\.js)/i.test(responseBody)
    ) {
      throw new Error('Callback request could not be confirmed.');
    }
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
