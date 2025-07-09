import { connectMessagePort } from "../messagePort/connectMessagePort";
import { connectUrl } from "../rp/common";
import { type } from "arktype";

// TODO: preload this page and its assets by loading it in a background iframe

const frameContextShape = type({
  id: "string",
  origin: "string",
});

let frameId = 0;

export function openRp(): {
  port: Promise<MessagePort>;
  destroy: () => void;
} {
  const id = `${Date.now()}-${++frameId}`;
  const frameContext = frameContextShape.from({ id, origin: window.location.origin });

  const url = new URL(connectUrl);
  url.hash = new URLSearchParams({ frame: JSON.stringify(frameContext) }).toString();

  const width = 400;
  const height = 500;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const target = window.open(
    url.toString(),
    // TODO: decide if it would be better to share a window across all rp instances
    "_blank",
    `popup,width=${width},height=${height},left=${left},top=${top},resizable=yes`,
  );
  if (!target) throw new Error("could not open rp window");

  const port = connectMessagePort({ id, target });

  return {
    port,
    destroy: () => {
      port.then((p) => p.close());
      target.close();
    },
  };
}

export function getFrameContext(url: string): typeof frameContextShape.infer {
  const parse = type("parse.json").to(frameContextShape);
  const hashParams = new URLSearchParams(new URL(url).hash.slice(1));
  const frameContext = parse(hashParams.get("frame"));
  if (frameContext instanceof type.errors) {
    throw new AggregateError(frameContext, `Could not parse frame context:\n\n${frameContext.toString()}`);
  }
  return frameContext;
}
