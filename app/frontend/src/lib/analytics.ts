export interface AnalyticsEventPayload {
  eventType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}

const analyticsUrl = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (!base) {
    return '';
  }
  return `${base.replace(/\/$/, '')}/analytics`;
})();

export async function sendAnalyticsEvent(payload: AnalyticsEventPayload) {
  if (!analyticsUrl) {
    return;
  }

  const body = JSON.stringify({ ...payload, source: payload.source ?? 'web' });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(analyticsUrl, blob);
    return;
  }

  try {
    await fetch(analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.warn('Failed to send analytics event', error);
  }
}
