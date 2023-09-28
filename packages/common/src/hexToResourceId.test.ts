import { describe, it, expect } from "vitest";
import { hexToResourceId } from "./hexToResourceId";

describe("hexToResourceId", () => {
  it("can convert from hex string", () => {
    const resourceId = hexToResourceId("0x74626e616d65737061636500000000006e616d65000000000000000000000000");
    expect(resourceId.type).toMatchInlineSnapshot('"table"');
    expect(resourceId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(resourceId.name).toMatchInlineSnapshot('"name"');
  });
});
