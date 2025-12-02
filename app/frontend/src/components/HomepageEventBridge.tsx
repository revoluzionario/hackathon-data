"use client";

import { useHomepageEvents } from "@/hooks/useHomepageEvents";

export function HomepageEventBridge() {
  useHomepageEvents();
  return null;
}
