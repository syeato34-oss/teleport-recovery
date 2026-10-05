export type CustomerEvent =
  | 'call_click'
  | 'callback_submit'
  | 'whatsapp_click'
  | 'guarantee_terms_view';

type EventContext = { location?: string };

/** No tags are loaded here. Never send callback details or other personal data. */
export function trackEvent(event: CustomerEvent, context: EventContext = {}): void {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as Window & {
    dataLayer?: { push: (item: { event: CustomerEvent } & EventContext) => unknown };
  };
  try {
    analyticsWindow.dataLayer?.push({ event, ...context });
  } catch {
    // Analytics must never interrupt a call or a recovery request.
  }
}
