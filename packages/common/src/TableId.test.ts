import { describe, it, expect } from "vitest";
import { TableId } from "./TableId";

describe("TableId", () => {
  it("can convert to hex string", () => {
    const tableId = new TableId("namespace", "name");
    expect(tableId.toHex()).toMatchInlineSnapshot(
      '"0x6e616d657370616365000000000000006e616d65000000000000000000000000"'
    );
  });

  it("throws when converting namespaces >16 bytes", () => {
    const tableId = new TableId("AVeryLongNamespace", "name");
    expect(() => tableId.toHex()).toThrowErrorMatchingInlineSnapshot(`
      "Size cannot exceed 16 bytes. Given size: 18 bytes.

      Version: viem@1.0.6"
    `);
  });

  it("throws when converting names >16 bytes", () => {
    const tableId = new TableId("namespace", "AnUnnecessarilyLongName");
    expect(() => tableId.toHex()).toThrowErrorMatchingInlineSnapshot(`
      "Size cannot exceed 16 bytes. Given size: 23 bytes.

      Version: viem@1.0.6"
    `);
  });

  it("can convert from hex string", () => {
    const tableId = TableId.fromHex("0x6e616d657370616365000000000000006e616d65000000000000000000000000");
    expect(tableId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(tableId.name).toMatchInlineSnapshot('"name"');
  });
});
