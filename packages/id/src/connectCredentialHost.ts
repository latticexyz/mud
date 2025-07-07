import { Hex } from "ox";
import { connectMessagePort } from "./sync/connectMessagePort";

export function connectCredentialHost({ rpId = "id.smartpass.dev" }: { rpId?: string } = {}) {
  const origin = `https://${rpId}`;
  const iframe = document.createElement("iframe");
  iframe.src = origin;
  iframe.allow = `publickey-credentials-get ${origin}; publickey-credentials-create ${origin}; clipboard-write`;
  iframe.sandbox.add(
    "allow-forms",
    "allow-scripts",
    "allow-same-origin",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
  );
  iframe.hidden = true;
  document.body.appendChild(iframe);

  let hostPort: MessagePort | undefined;
  connectMessagePort({
    target: iframe.contentWindow!,
    onPort: (port) => (hostPort = port),
  });

  return {
    async create() {
      if (!hostPort) throw new Error("no port with host");

      hostPort.addEventListener(
        "message",
        function onMessage(event) {
          console.log("got reply from post", event);
        },
        // TODO: redo this, as this won't always be the next reply
        { once: true },
      );

      console.log("asking host to create");
      hostPort.postMessage("create");
    },
    async sign(message: Hex.Hex) {
      if (!hostPort) throw new Error("no port with host");

      hostPort.addEventListener(
        "message",
        function onMessage(event) {
          console.log("got reply from post", event);
        },
        // TODO: redo this, as this won't always be the next reply
        { once: true },
      );

      console.log("asking host to sign");
      hostPort.postMessage("sign");
    },
  };
}
