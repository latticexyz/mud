// TODO: put this in some sort of "common" package we can import throughout

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
    return toTableId(this.namespace, this.name);
  }
}

const arrayToHex = (array: Uint8Array | ArrayBuffer): string =>
  `0x${[...new Uint8Array(array)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

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
