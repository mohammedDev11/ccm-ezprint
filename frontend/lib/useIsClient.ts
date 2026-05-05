"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
