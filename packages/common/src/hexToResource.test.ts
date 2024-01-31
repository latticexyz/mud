import { describe, it, expect } from "vitest";
import { hexToResource } from "./hexToResource";

describe("hexToResource", () => {
  it("can convert from hex string", () => {
    const resource = hexToResource("0x74626e616d65737061636500000000006e616d65000000000000000000000000");
    expect(resource.type).toMatchInlineSnapshot('"table"');
    expect(resource.namespace).toMatchInlineSnapshot('"namespace"');
    expect(resource.name).toMatchInlineSnapshot('"name"');
  });
});
