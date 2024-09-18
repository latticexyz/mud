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
  const bridge = new Promise<HTMLIFrameElement>((resolve, reject) => {
    const iframe =
      Array.from(document.querySelectorAll("iframe[data-bridge][src]"))
        .filter((el): el is HTMLIFrameElement => true)
        .find((el) => el.src === url) ?? document.createElement("iframe");

    if (iframe.dataset.bridge === "ready") {
      debug("reusing observer iframe", iframe.src);
      return resolve(iframe);
    }

    Promise.race([
      new Promise<void>((resolve, reject) => {
        iframe.addEventListener("load", () => resolve(), { once: true });
        iframe.addEventListener("error", (error) => reject(error), { once: true });
      }),
      wait(timeout).then(() => {
        throw new Error("Timed out waiting for observer iframe to load.");
      }),
    ]).then(
      () => {
        debug("observer iframe ready", iframe.src);
        iframe.dataset.bridge = "ready";
        resolve(iframe);
      },
      (error) => {
        debug("observer iframe error", error);
        iframe.remove();
        reject(error);
      },
    );

    if (iframe.dataset.bridge !== "loading") {
      iframe.tabIndex = -1;
      iframe.ariaHidden = "true";
      iframe.style.position = "absolute";
      iframe.style.border = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.dataset.bridge = "loading";
      iframe.src = url;
      debug("mounting observer iframe", url);
      parent.document.body.appendChild(iframe);
    }
  });

  return (type, data) => {
    debug("got message for bridge", type, data);
    bridge.then(
      (iframe) => {
        debug("posting message to bridge", type, data);
        const message = wrapMessage({ type, time: Date.now(), ...data });
        iframe.contentWindow!.postMessage(message, "*");
      },
      (error) => debug("could not deliver message", type, data, error),
    );
  };
}
