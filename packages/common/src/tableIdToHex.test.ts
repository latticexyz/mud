import { describe, it, expect } from "vitest";
import { tableIdToHex } from "./tableIdToHex";
import { hexToTableId } from "./hexToTableId";

describe("tableIdToHex", () => {
  it("can convert to hex string", () => {
    const tableIdHex = tableIdToHex("namespace", "name");
    expect(tableIdHex).toMatchInlineSnapshot('"0x6e616d657370616365000000000000006e616d65000000000000000000000000"');
  });

  it("truncates namespaces >16 bytes", () => {
    const hex = "0x41566572794c6f6e674e616d657370616e616d65000000000000000000000000";
    const tableIdHex = tableIdToHex("AVeryLongNamespace", "name");
    expect(tableIdHex).toEqual(hex);
    expect(hexToTableId(tableIdHex).namespace).toMatchInlineSnapshot('"AVeryLongNamespa"');
  });

  it("truncates names >16 bytes", () => {
    const hex = "0x6e616d65737061636500000000000000416e556e6e65636573736172696c794c";
    const tableIdHex = tableIdToHex("namespace", "AnUnnecessarilyLongName");
    expect(tableIdHex).toEqual(hex);
    expect(hexToTableId(tableIdHex).name).toMatchInlineSnapshot('"AnUnnecessarilyL"');
  });
});
