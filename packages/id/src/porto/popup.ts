import { Messenger } from "porto";
import {
  type Dialog,
  from,
  getDialogUrl,
  getReferrer,
  handleBlur,
  handleResponse,
  noop,
  requiresConfirmation,
} from "porto/Dialog";

// TODO: remove this once https://github.com/ithacaxyz/porto/pull/565 and https://github.com/ithacaxyz/porto/pull/568 land

export const defaultSize = { width: 400, height: 400 };

export function popup(): Dialog {
  if (typeof window === "undefined") return noop();

  // TODO: make configurable
  const { width, height } = defaultSize;

  return from({
    name: "popup",
    supportsHeadless: true,
    setup(parameters) {
      console.log("popup.setup()");

      const { host, internal } = parameters;
      const { store } = internal;

      const hostUrl = new URL(host);

      let popup: Window | null = null;

      function onBlur() {
        if (popup) handleBlur(store);
      }

      setInterval(() => {
        if (popup?.closed) {
          handleBlur(store);
        }
      }, 100);

      let messenger: Messenger.Bridge | undefined;

      return {
        close() {
          if (!popup) return;
          popup.close();
          popup = null;
        },
        destroy() {
          this.close();
          window.removeEventListener("focus", onBlur);
          messenger?.destroy();
        },
        open() {
          const left = (window.innerWidth - width) / 2 + window.screenX;
          const top = window.screenY + 100;

          popup = window.open(getDialogUrl(host), "_blank", `width=${width},height=${height},left=${left},top=${top}`);
          if (!popup) throw new Error("Failed to open popup");

          messenger = Messenger.bridge({
            from: Messenger.fromWindow(window, {
              targetOrigin: hostUrl.origin,
            }),
            to: Messenger.fromWindow(popup, {
              targetOrigin: hostUrl.origin,
            }),
            waitForReady: true,
          });

          messenger.send("__internal", {
            mode: "popup",
            referrer: getReferrer(),
            type: "init",
          });

          messenger.on("rpc-response", (response) => handleResponse(store, response));

          messenger.on("__internal", (_payload) => {});

          window.addEventListener("focus", onBlur);
        },
        async syncRequests(requests) {
          const requiresConfirm = requests.some((x) => requiresConfirmation(x.request));
          if (requiresConfirm) {
            if (!popup || popup.closed) {
              // https://github.com/ithacaxyz/porto/issues/581
              try {
                console.log("opening popup", requests);
                this.open();
              } catch (error) {
                console.warn("could not open popup, treating it as a user rejection", error);
                return handleBlur(store);
              }
            }
            popup?.focus();
          }
          messenger?.send("rpc-requests", requests);
        },
      };
    },
  });
}
