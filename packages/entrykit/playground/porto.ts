import { mode, porto as portoConnector } from "@latticexyz/id/internal";

export function porto() {
  return portoConnector({
    mode: mode(),
  });
}
