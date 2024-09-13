"use client";

import { wait } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { EmitMessage } from "./messages";

export type BridgeEnvelope = { mud: "explorer/observer"; data: unknown };

export function isBridgeEnvelope(input: unknown): input is BridgeEnvelope {
  return (
    typeof input === "object" &&
    input !== null &&
    "mud" in input &&
    input.mud === "explorer/observer" &&
    "data" in input
  );
}

export function wrapMessage(data: unknown): BridgeEnvelope {
  return { mud: "explorer/observer", data };
}

export type CreateBridgeOpts = {
  url: string;
  timeout?: number;
};

export function createBridge({ url, timeout = 10_000 }: CreateBridgeOpts): EmitMessage {
  const emit = Promise.withResolvers<EmitMessage>();
  const iframe = document.createElement("iframe");
  iframe.tabIndex = -1;
  iframe.ariaHidden = "true";
  iframe.style.position = "absolute";
  iframe.style.border = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";

  iframe.addEventListener(
    "load",
    () => {
      debug("observer iframe ready", iframe.src);
      // TODO: throw if `iframe.contentWindow` is `null`?
      emit.resolve((type, data) => {
        const message = wrapMessage({ ...data, type, time: Date.now() });
        debug("posting message to bridge", message);
        iframe.contentWindow!.postMessage(message, "*");
      });
    },
    { once: true },
  );

  iframe.addEventListener(
    "error",
    (error) => {
      debug("observer iframe error", error);
      emit.reject(error);
    },
    { once: true },
  );

  // TODO: should we let the caller handle this with their own promise timeout or race?
  wait(timeout).then(() => {
    emit.reject(new Error("Timed out waiting for observer iframe to load."));
  });

  debug("mounting observer iframe", url);
  iframe.src = url;
  parent.document.body.appendChild(iframe);

  emit.promise.catch(() => {
    iframe.remove();
  });

  return (messageType, message) => {
    debug("got message for bridge", messageType, message);
    emit.promise.then(
      (fn) => fn(messageType, message),
      (error) => debug("could not deliver message", message, error),
    );
  };
}
