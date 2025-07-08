import { sharedState } from "../sync/sharedState";
import { syncPort } from "../sync/syncPort";
import { debug } from "./debug";
import { connectRp } from "./connectRp";

export function syncRp() {
  let stopSync: null | (() => void) = null;
  const disconnect = connectRp({
    onPort: (port) => {
      stopSync?.();
      stopSync = syncPort("rp", port);
    },
  });

  return () => {
    stopSync?.();
    disconnect();
  };
}

sharedState.subscribe((state, prevState) => {
  if (state.accounts !== prevState.accounts) {
    debug("accounts updated by", state.lastUpdate?.by, state.accounts);
  }
});
