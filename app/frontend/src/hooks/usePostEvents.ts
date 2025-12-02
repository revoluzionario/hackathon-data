"use client";

import { useEffect } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";

export function usePostEvents(postId: string | number | undefined) {
  useEffect(() => {
    if (!postId) return;

    const id = String(postId);

    // Immediate view event
    sendAnalyticsEvent({ eventType: "view_post", entityId: id });

    // Dwell time after 5 seconds
    const timer = setTimeout(() => {
      sendAnalyticsEvent({ eventType: "post_dwell_time", entityId: id, metadata: { seconds: 5 } });
    }, 5000);

    return () => clearTimeout(timer);
  }, [postId]);
}
"use client";

import { useEffect } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics";

export function usePostEvents(postId: string, pagePath?: string) {
  const entityId = postId;

  useEffect(() => {
    sendAnalyticsEvent({ eventType: "view_post", entityId });
    sendAnalyticsEvent({ eventType: "page_view", entityId: pagePath ?? `/posts/${entityId}` });
    const timer = setTimeout(() => {
      sendAnalyticsEvent({ eventType: "post_dwell_time", entityId, metadata: { seconds: 5 } });
    }, 5000);
    return () => clearTimeout(timer);
  }, [entityId, pagePath]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    let fired = false;
    const handleScroll = () => {
      if (fired) return;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (progress >= 0.6) {
        fired = true;
        sendAnalyticsEvent({
          eventType: "scroll_depth",
          entityId,
          metadata: { depth: 60 },
        });
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [entityId]);
}
