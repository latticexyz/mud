import { describe, it, expect } from "vitest";
import { hexToResourceId } from "./hexToResourceId";

describe("hexToResourceId", () => {
  it("can convert from hex string", () => {
    const resourceId = hexToResourceId("0x6e616d65737061636500000000006e616d650000000000000000000000007462");
    expect(resourceId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(resourceId.name).toMatchInlineSnapshot('"name"');
    expect(resourceId.type).toMatchInlineSnapshot('"table"');
  });
});
