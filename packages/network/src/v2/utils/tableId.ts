import { utils } from "ethers";
import { arrayToHex } from "./arrayToHex";

// TODO: put this in some sort of "common" package we can import throughout

class TableId {
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
    return toTableId(this.namespace, this.name);
  }
}

const stringToBytes16 = (str: string): Uint8Array => {
  if (str.length > 16) throw new Error("string too long");
  return new Uint8Array(16).map((v, i) => str.charCodeAt(i));
};
const bytesToString = (bytes: Uint8Array): string => [...bytes].map((x) => String.fromCharCode(x)).join("");

export const toTableId = (namespace: string, name: string) => {
  const tableId = new Uint8Array(32);
  tableId.set(stringToBytes16(namespace), 0);
  tableId.set(stringToBytes16(name), 16);
  return arrayToHex(tableId);
};

export const fromTableId = (tableId: utils.BytesLike) => {
  // assumes tableId is a 32-byte hex string, otherwise it left-pads with zeros (for numbers)
  // this is scary, since zero padding is different depending on the type
  const tableIdBytes = utils.zeroPad(utils.arrayify(tableId), 32);
  const namespace = bytesToString(tableIdBytes.slice(0, 16)).replace(/\0+$/, "");
  const name = bytesToString(tableIdBytes.slice(16, 32)).replace(/\0+$/, "");
  return new TableId(namespace, name);
};
