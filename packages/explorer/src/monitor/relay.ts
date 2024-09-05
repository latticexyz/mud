"use client";

import debug from "debug";
import { isBridgeEnvelope } from "./bridge";

export function createRelay(): () => void {
  const channel = new BroadcastChannel("explorer/monitor");
  function relay(event: MessageEvent) {
    console.log("got window message", isBridgeEnvelope(event.data), event);
    if (isBridgeEnvelope(event.data)) {
      console.log("relaying message from bridge", event.data.data);
      debug("relaying message from bridge");
      channel.postMessage(event.data.data);
    }
  }
  console.log("listening to window messages");
  window.addEventListener("message", relay);
  return () => {
    console.log("removing listener");
    window.removeEventListener("message", relay);
  };
}
