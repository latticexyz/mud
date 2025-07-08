import { connectMessagePort } from "../messagePort/connectMessagePort";
import { rpUrl } from "../rp/common";
import { type } from "arktype";

const frameContextShape = type({
  id: "string",
  origin: "string",
});

let frameId = 0;

export function connectRp({ onPort }: { onPort: (port: MessagePort) => void }): () => void {
  const id = `${Date.now()}-${++frameId}`;
  const frameContext = frameContextShape.from({ id, origin: window.location.origin });

  const url = new URL(rpUrl);
  url.hash = new URLSearchParams({ frame: JSON.stringify(frameContext) }).toString();

  const iframe = document.createElement("iframe");
  iframe.src = url.toString();
  iframe.allow = `publickey-credentials-get ${url.origin}; publickey-credentials-create ${url.origin}; clipboard-write`;
  iframe.sandbox.add(
    "allow-forms",
    "allow-scripts",
    "allow-same-origin",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
  );
  iframe.hidden = true;
  document.body.appendChild(iframe);

  const disconnect = connectMessagePort({ id, target: iframe.contentWindow!, onPort });

  return () => {
    disconnect();
    iframe.remove();
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
