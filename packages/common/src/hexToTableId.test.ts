import { describe, it, expect } from "vitest";
import { hexToTableId } from "./hexToTableId";

describe("hexToTableId", () => {
  it("can convert from hex string", () => {
    const tableId = hexToTableId("0x6e616d657370616365000000000000006e616d65000000000000000000000000");
    expect(tableId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(tableId.name).toMatchInlineSnapshot('"name"');
  });
});
