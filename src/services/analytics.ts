export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const trackEvent = (name: string, payload: AnalyticsPayload = {}): void => {
  const event = {
    event: name,
    ts: new Date().toISOString(),
    ...payload,
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
    window.dispatchEvent(new CustomEvent('clinic:analytics', { detail: event }));
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[analytics]', event);
  }
};
