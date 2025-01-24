"use client";

import { isBridgeEnvelope } from "./bridge";
import { relayChannelName } from "./common";
import { debug } from "./debug";

export function createRelay(): () => void {
  debug("creating relay");
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
    channel.close();
  };
}
