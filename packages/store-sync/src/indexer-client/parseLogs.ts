import { StorageAdapterLog } from "../common";
import { dropValue, parseJson } from "./parseJson";

/**
 * @internal
 */
export async function parseLogs(
  body: ReadableStream<Uint8Array>,
  onLog: (log: StorageAdapterLog) => void,
): Promise<unknown> {
  return parseJson(body, (path, value) => {
    if (path === ".logs.*") {
      onLog(value as never);
      return dropValue;
    }
  });
}
