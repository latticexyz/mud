import { connectMessagePort } from "../messagePort/connectMessagePort";
import { appendFrameId } from "../frameId";
import { rpUrl } from "../rp/common";
import { sharedState } from "../sync/sharedState";
import { syncPort } from "../sync/syncPort";
import { debug } from "./debug";

export function syncRp() {
  const { id, url } = appendFrameId(rpUrl);

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

  let cleanUp: null | (() => void) = null;
  const disconnect = connectMessagePort({
    id,
    target: iframe.contentWindow!,
    onPort: (port) => {
      cleanUp?.();
      cleanUp = syncPort("rp", port);
    },
  });

  return () => {
    disconnect();
    iframe.remove();
  };
}

sharedState.subscribe((state, prevState) => {
  if (state.accounts !== prevState.accounts) {
    debug("accounts updated by", state.lastUpdate?.by, state.accounts);
  }
});
