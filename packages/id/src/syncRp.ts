import { connectMessagePort } from "./messagePort/connectMessagePort";
import { rpUrl } from "./rp/common";
import { syncPort } from "./sync/syncPort";

export function syncRp() {
  const iframe = document.createElement("iframe");
  iframe.src = rpUrl.toString();
  iframe.allow = `publickey-credentials-get ${rpUrl.origin}; publickey-credentials-create ${rpUrl.origin}; clipboard-write`;
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
