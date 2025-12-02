"use client";

import { useEffect } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";

export function useHomepageEvents() {
  useEffect(() => {
    sendAnalyticsEvent({ eventType: "page_view", entityId: "/" });

    const dwellTimer = setTimeout(() => {
      void sendAnalyticsEvent({
        eventType: "dwell_time",
        metadata: { seconds: 5 },
        entityId: "/",
      });
    }, 5000);

    return () => {
      clearTimeout(dwellTimer);
    };
  }, []);
}
