import { sharedState } from "./sharedState";
import { syncMessageShape } from "./common";
import { debug } from "./debug";

export function syncPort(from: "rp" | "client", port: MessagePort) {
  function onMessage(event: MessageEvent) {
    if (!syncMessageShape.allows(event.data)) return;

    const { lastUpdate } = sharedState.getState();
    // TODO: log that we got and are discarding outdated state?
    if (lastUpdate && lastUpdate.at > event.data.at) return;

    debug("got state from", from, event.data.state);
    sharedState.setState({
      ...event.data.state,
      lastUpdate: {
        by: from,
        at: event.data.at,
      },
    });
  }

  port.addEventListener("message", onMessage);

  const unsub = sharedState.subscribe((state) => {
    if (state.lastUpdate?.by === from) return;

    debug("sending state to", from, state);
    port.postMessage(
      syncMessageShape.from({
        type: "sync",
        at: new Date(),
        state,
      }),
    );
  });

  return () => {
    port.removeEventListener("message", onMessage);
    unsub();
  };
}
