"use client";

import React from "react";
import { usePostEvents } from "@/hooks/usePostEvents";

interface Props {
  postId?: string | number;
}

export default function PostEventsClient({ postId }: Props) {
  usePostEvents(postId);
  return null;
}
