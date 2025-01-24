import { logSort, resourceToLabel, hexToResource } from "@latticexyz/common";
import { StoreLog } from "../storeLog";

export function summarizeLogs(logs: StoreLog[]) {
  return logs
    .slice()
    .sort(logSort)
    .map(
      ({ eventName, args: { tableId, keyTuple } }) =>
        `${eventName}  ${resourceToLabel(hexToResource(tableId))}  (${keyTuple})`,
    );
}
