/**
 * Analytics & growth event tracking service.
 * SWAP POINT: Forward tracked events to PostHog, GA4, Amplitude, or Telegram bot webhook.
 */
import { readStorage, writeStorage } from './storage';

export type AnalyticsEventName =
  | 'search'
  | 'ai_smart_search'
  | 'compare_added'
  | 'compare_viewed'
  | 'booking_started'
  | 'booking_completed'
  | 'review_submitted'
  | 'share_clicked'
  | 'referral_copied';

export interface TrackedEvent {
  name: AnalyticsEventName;
  props: Record<string, unknown>;
  timestamp: string;
}

export const analyticsService = {
  track(name: AnalyticsEventName, props: Record<string, unknown> = {}) {
    const existing = readStorage<TrackedEvent[]>('analytics_events', []);
    const next = [{ name, props, timestamp: new Date().toISOString() }, ...existing].slice(0, 100);
    writeStorage('analytics_events', next);
  },
  getRecent(): TrackedEvent[] {
    return readStorage<TrackedEvent[]>('analytics_events', []);
  },
};
