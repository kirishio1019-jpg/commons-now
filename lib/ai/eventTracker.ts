import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase";
import { AIEvent } from "./types";
import { AI } from "./constants";
import { CommitLevel, NotificationType } from "../../types";

const QUEUE_KEY = "@ai_events_queue";

class EventTracker {
  private queue: AIEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;

  init(userId: string) {
    this.userId = userId;
    this.loadQueue();
    this.flushTimer = setInterval(() => this.flushToStorage(), AI.MEMORY_FLUSH_MS);
    this.syncTimer = setInterval(() => this.syncToSupabase(), AI.SUPABASE_SYNC_MS);
  }

  destroy() {
    this.flushToStorage();
    this.syncToSupabase();
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.flushTimer = null;
    this.syncTimer = null;
  }

  private push(event_type: string, wave_id?: string, payload: Record<string, any> = {}) {
    if (!this.userId) return;
    this.queue.push({
      event_type,
      wave_id,
      payload,
      created_at: new Date().toISOString(),
    });
    if (this.queue.length > AI.MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-AI.MAX_QUEUE_SIZE);
    }
  }

  // --- Public tracking methods ---

  trackImpression(waveId: string, position: number, feedTab: string) {
    this.push("wave_impression", waveId, { position, feed_tab: feedTab });
  }

  trackDwell(waveId: string, durationMs: number) {
    if (durationMs < AI.DWELL_MIN_MS) return;
    this.push("wave_dwell", waveId, { duration_ms: durationMs });
  }

  trackDetailView(waveId: string) {
    this.push("wave_detail_view", waveId);
  }

  trackCommitChange(waveId: string, from: CommitLevel, to: CommitLevel) {
    this.push("wave_commit_change", waveId, { from, to });
  }

  trackClipView(waveId: string, clipId: string) {
    this.push("clip_view", waveId, { clip_id: clipId });
  }

  trackClipPost(waveId: string) {
    this.push("clip_post", waveId);
  }

  trackNotificationTap(notificationId: string, type: NotificationType, waveId?: string) {
    this.push("notification_tap", waveId, { notification_id: notificationId, notification_type: type });
  }

  trackNotificationDismiss(notificationId: string, type: NotificationType) {
    this.push("notification_dismiss", undefined, { notification_id: notificationId, notification_type: type });
  }

  trackMapInteraction(zoomLevel: number, centerLat: number, centerLng: number) {
    this.push("map_interaction", undefined, { zoom_level: zoomLevel, center_lat: centerLat, center_lng: centerLng });
  }

  trackTabSwitch(fromTab: string, toTab: string) {
    this.push("tab_switch", undefined, { from: fromTab, to: toTab });
  }

  trackSessionStart() {
    this.push("app_session_start");
  }

  trackSessionEnd(durationMs: number) {
    this.push("app_session_end", undefined, { duration_ms: durationMs });
  }

  // --- Queue access (for preference learning) ---

  getRecentEvents(limit: number = 200): AIEvent[] {
    return this.queue.slice(-limit);
  }

  getEventCount(): number {
    return this.queue.length;
  }

  // --- Internal ---

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AIEvent[];
        this.queue = [...parsed, ...this.queue];
      }
    } catch {}
  }

  private async flushToStorage() {
    if (this.queue.length === 0) return;
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue.slice(-AI.MAX_QUEUE_SIZE)));
    } catch {}
  }

  async syncToSupabase() {
    if (!this.userId || this.queue.length === 0) return;
    const batch = this.queue.splice(0, 100);
    try {
      const rows = batch.map((e) => ({
        user_id: this.userId!,
        event_type: e.event_type,
        wave_id: e.wave_id || null,
        payload: e.payload,
        created_at: e.created_at,
      }));
      const { error } = await supabase.from("user_events").insert(rows);
      if (error) {
        // Table may not exist yet — silently keep events local
        this.queue.unshift(...batch);
        return;
      }
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      this.queue.unshift(...batch);
    }
  }
}

export const eventTracker = new EventTracker();
