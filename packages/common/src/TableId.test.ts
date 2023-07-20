import { describe, it, expect } from "vitest";
import { TableId } from "./TableId";

describe("TableId", () => {
  it("can convert to hex string", () => {
    const tableId = new TableId("namespace", "name");
    expect(tableId.toHex()).toMatchInlineSnapshot(
      '"0x6e616d657370616365000000000000006e616d65000000000000000000000000"'
    );
  });

  it("can convert from hex string", () => {
    const tableId = TableId.fromHex("0x6e616d657370616365000000000000006e616d65000000000000000000000000");
    expect(tableId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(tableId.name).toMatchInlineSnapshot('"name"');
  });

  it("truncates namespaces >16 bytes", () => {
    expect(TableId.toHex("AVeryLongNamespace", "name")).toMatchInlineSnapshot();
    const tableId = new TableId("AVeryLongNamespace", "name");
    expect(tableId.toHex()).toMatchInlineSnapshot(
      '"0x41566572794c6f6e674e616d657370616e616d65000000000000000000000000"'
    );
    expect(TableId.fromHex(tableId.toHex()).namespace).toMatchInlineSnapshot('"AVeryLongNamespa"');
  });

  it("truncates names >16 bytes", () => {
    expect(TableId.toHex("namespace", "AnUnnecessarilyLongName")).toMatchInlineSnapshot();
    const tableId = new TableId("namespace", "AnUnnecessarilyLongName");
    expect(tableId.toHex()).toMatchInlineSnapshot(
      '"0x6e616d65737061636500000000000000416e556e6e65636573736172696c794c"'
    );
    expect(TableId.fromHex(tableId.toHex()).name).toMatchInlineSnapshot('"AnUnnecessarilyL"');
  });
});
