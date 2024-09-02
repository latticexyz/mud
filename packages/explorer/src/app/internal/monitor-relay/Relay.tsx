"use client";

import { useEffect } from "react";
import { channel } from "../../../transactions/channel";

// TODO: set up MessageChannel instead of postMessage receiver
// TODO: handshake
// TODO: debug logging

export function Relay() {
  useEffect(() => {
    function relay(event: MessageEvent) {
      if (event.data.channel === "mud:explorer:monitor") {
        channel.postMessage(event.data.data);
      }
    }
    window.addEventListener("message", relay);
    return () => {
      window.removeEventListener("message", relay);
    };
  }, []);

  return null;
}
