import { Hex, stringToHex, hexToString, sliceHex, concatHex } from "viem";

export class TableId {
  readonly namespace: string;
  readonly name: string;

  constructor(namespace: string, name: string) {
    this.namespace = namespace.substring(0, 16);
    this.name = name.substring(0, 16);
  }

  toString(): string {
    return `TableId<${this.namespace || "[empty]"}:${this.name || "[empty]"}>`;
  }

  toHex(): Hex {
    return TableId.toHex(this.namespace, this.name);
  }

  static toHex(namespace: string, name: string): Hex {
    return concatHex([
      stringToHex(namespace.substring(0, 16), { size: 16 }),
      stringToHex(name.substring(0, 16), { size: 16 }),
    ]);
  }

  static fromHex(hex: Hex): TableId {
    const namespace = hexToString(sliceHex(hex, 0, 16)).replace(/\0+$/, "");
    const name = hexToString(sliceHex(hex, 16, 32)).replace(/\0+$/, "");
    return new TableId(namespace, name);
  }

  /** @deprecated Don't use this! This is a temporary hack for v2<>v1 compatibility until we can write v2 client libraries. This is here so it stays close to the formatting of `toString()` above. */
  static parse(tableIdString: string): TableId | null {
    const match = tableIdString.match(/^TableId<(.+?):(.+?)>$/);
    if (!match) return null;
    const [, namespace, name] = match;
    return new TableId(namespace === "[empty]" ? "" : namespace, name === "[empty]" ? "" : name);
  }
}
