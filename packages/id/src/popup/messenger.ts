import { Messenger } from "porto";

export const messenger = (() => {
  if (typeof window === "undefined") return Messenger.noop();

  return Messenger.bridge({
    from: Messenger.fromWindow(window),
    to: Messenger.fromWindow(window.opener ?? window.parent),
  });
})();

messenger.on("rpc-requests", (requests) => {
  console.log("messenger rpc-requests", requests);
});
messenger.on("__internal", () => {
  console.log("messenger __internal");
});

messenger.on("ready", () => {
  console.log("messenger ready");
});
