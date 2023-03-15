import { arrayToHex } from "./arrayToHex";
import { bytesToString } from "./bytesToString";
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

  static fromBytes32(tableId: Uint8Array) {
    // assumes tableId is a 32-byte hex string, otherwise it left-pads with zeros (for numbers)
    // this is scary, since zero padding is different depending on the type (bytes types vs number types)
    // TODO: fix this after we move tableIds to bytes32 instead of uint256
    const tableIdBytes = new Uint8Array(32);
    tableIdBytes.set(tableId.reverse());
    tableIdBytes.reverse();
    const namespace = bytesToString(tableIdBytes.slice(0, 16)).replace(/\0+$/, "");
    const name = bytesToString(tableIdBytes.slice(16, 32)).replace(/\0+$/, "");
    return new TableId(namespace, name);
  }
}
