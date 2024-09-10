"use client";

import debug from "debug";
import { isBridgeEnvelope } from "./bridge";
import { relayChannelName } from "./common";

export function createRelay(): () => void {
  const channel = new BroadcastChannel(relayChannelName);
  function relay(event: MessageEvent) {
    if (isBridgeEnvelope(event.data)) {
      debug("relaying message from bridge");
      channel.postMessage(event.data.data);
    }
  }
  window.addEventListener("message", relay);
  return () => {
    window.removeEventListener("message", relay);
  };
}
