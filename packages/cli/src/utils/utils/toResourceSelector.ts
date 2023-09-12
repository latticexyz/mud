// TODO: use TableId from utils as soon as utils are usable inside cli
import { toBytes16 } from "./toBytes16";

// (see https://github.com/latticexyz/mud/issues/499)
export function toResourceSelector(namespace: string, file: string): Uint8Array {
  const namespaceBytes = toBytes16(namespace);
  const fileBytes = toBytes16(file);
  const result = new Uint8Array(32);
  result.set(namespaceBytes);
  result.set(fileBytes, 16);
  return result;
}
