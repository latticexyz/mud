import { Hex, LocalAccount } from "viem";
import { RequestData, ResponseData } from "./common";

// TODO: should this extend something other than LocalAccount?
export type PostMessageAccount = LocalAccount<"postMessage">;

let messageId = 0;

export async function createPostMessageAccount(): Promise<PostMessageAccount> {
  // TODO: make configurable
  const signerUrl = new URL("http://localhost:45690/");
  const parent = window;
  const child = await new Promise<Window>((resolve) => {
    // make configurable
    const iframe = document.createElement("iframe");
    // TODO: throw if `iframe.contentWindow` is `null`
    iframe.addEventListener("load", () => resolve(iframe.contentWindow!));
    // TODO: do handshake before resolving
    iframe.src = signerUrl.toString();
    parent.document.body.appendChild(iframe);
  });

  return {
    type: "local",
    source: "postMessage",
    // TODO: get these from iframe handshake?
    publicKey: "0x",
    address: "0x",
    signMessage: (args) => {
      console.log("sign message called");
      return new Promise<Hex>((resolve) => {
        const id = ++messageId;
        console.log("listening for messages");
        parent.addEventListener("message", function reply(event: MessageEvent<ResponseData>): void {
          if (event.origin !== signerUrl.origin) return;
          console.log("got message", event);
          if (event.data.type === "reply" && event.data.id === id) {
            console.log("it was a reply");
            resolve(event.data.result);
            parent.removeEventListener("message", reply);
          }
        });
        // TODO: add timeout, remove listener + reject
        // TODO: add retry
        console.log("sending request");
        child.postMessage(
          {
            id,
            method: "signMessage",
            args,
          } satisfies RequestData,
          {
            targetOrigin: signerUrl.origin,
          },
        );
      });
    },
    signTransaction: () => {
      throw new Error("Not implemented");
    },
    signTypedData: () => {
      throw new Error("Not implemented");
    },
  };
}
