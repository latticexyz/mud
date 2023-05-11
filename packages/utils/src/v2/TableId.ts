import { arrayToHex } from "./arrayToHex";
import { bytesToString } from "./bytesToString";
import { hexToArray } from "./hexToArray";
import { stringToBytes16 } from "./stringToBytes16";

export class TableId {
  namespace: string;
  name: string;

  constructor(namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }

  toString() {
    return `TableId<${this.namespace || "[empty]"}:${this.name || "[empty]"}>`;
  }

  toHexString() {
    return TableId.toHexString(this.namespace, this.name);
  }

  static toHexString(namespace: string, name: string) {
    const tableId = new Uint8Array(32);
    tableId.set(stringToBytes16(namespace), 0);
    tableId.set(stringToBytes16(name), 16);
    return arrayToHex(tableId);
  }

  static fromHexString(tableId: string) {
    return TableId.fromBytes32(hexToArray(tableId));
  }

  static fromBytes32(tableId: Uint8Array) {
    const tableIdBytes = new Uint8Array(32);
    tableIdBytes.set(tableId);
    const namespace = bytesToString(tableIdBytes.slice(0, 16)).replace(/\0+$/, "");
    const name = bytesToString(tableIdBytes.slice(16, 32)).replace(/\0+$/, "");
    return new TableId(namespace, name);
  }

  /** @deprecated Don't use this! This is a temporary hack for v2<>v1 compatibility until we can write v2 client libraries. This is here so it stays close to the formatting of `toString()` above. */
  static parse(tableIdString: string) {
    const match = tableIdString.match(/^TableId<(.+?):(.+?)>$/);
    if (!match) return null;
    const [, namespace, name] = match;
    return new TableId(namespace === "[empty]" ? "" : namespace, name === "[empty]" ? "" : name);
  }
}
