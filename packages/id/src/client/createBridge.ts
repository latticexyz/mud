import { methods } from "../rpc/methods";
import { RequestData, ResponseData } from "../rpc/schema";
import { createPort } from "./createPort";

export type PasskeyBridge = {
  request: <method extends keyof methods>(
    method: method,
    ...params: RequestData<method>["params"]
  ) => Promise<Awaited<ReturnType<methods[method]>>>;
  close: () => void;
};

export async function createBridge({
  url: initialUrl,
  message,
}: { url?: string; message?: string } = {}): Promise<PasskeyBridge> {
  const urlParams = new URLSearchParams({
    ...(message ? { message } : {}),
  });
  const url = new URL(`/#${urlParams}`, initialUrl ?? "https://id.mud.dev");

  // Ideally we'd use a hidden iframe for this, but this doesn't work in Safari.
  // And there seems to be no way to detect Safari support in a hidden iframe, so
  // we can't conditionally use an iframe for browserrs that support it.
  // So we'll go with the uglier popup style approach.

  // const bridge = await new Promise<Window>((resolve, reject) => {
  //   const iframe = document.createElement("iframe");
  //   iframe.allow = "publickey-credentials-get *; publickey-credentials-create *";
  //   iframe.src = url.origin;
  //   iframe.addEventListener("load", () => {
  //     if (iframe.contentWindow) {
  //       resolve(iframe.contentWindow);
  //     } else {
  //       reject(new Error("iframe had no contentWindow after load?"));
  //     }
  //   });
  //   document.body.appendChild(iframe);
  // });

  let bridge = window.open(url, "MUD ID", "popup,width=600,height=400");
  if (!bridge) {
    throw new Error(`Could not open window for MUD ID bridge at "${url.origin}".`);
  }

  // TODO: close window if timed out
  const port = await createPort({ bridge, origin: url.origin, signal: AbortSignal.timeout(1000 * 10) });

  let currentId = 0;
  async function request<method extends keyof methods>(
    method: method,
    ...params: RequestData<method>["params"]
  ): Promise<Awaited<ReturnType<methods[method]>>> {
    return new Promise<Awaited<ReturnType<methods[method]>>>((resolve, reject) => {
      // TODO: detect if window was closed by user
      //       maybe can use `window.opener == null` but that may be blocked in some security contexts?
      if (!bridge) {
        throw new Error("MUD ID bridge was closed.");
      }

      // TODO: maybe don't need message IDs if we use a port per request?
      const request = { id: ++currentId, method, params };
      port.addEventListener("message", (event: MessageEvent<ResponseData>) => {
        const response = event.data;
        if (response.id === request.id) {
          if (response.error) {
            // TODO: do something with error.code/data as well?
            reject(new Error(response.error.message));
          } else {
            resolve(response.result as never);
          }
        }
      });

      port.postMessage(request);
    });
  }

  return {
    request,
    close: () => {
      bridge?.close();
      bridge = null;
    },
  };
}
