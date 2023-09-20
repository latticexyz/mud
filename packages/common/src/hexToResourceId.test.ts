import { describe, it, expect } from "vitest";
import { hexToResourceId } from "./hexToResourceId";

describe("hexToResourceId", () => {
  it("can convert from hex string", () => {
    const resourceId = hexToResourceId("0x6e616d657370616365000000000000006e616d65000000000000000000000000");
    expect(resourceId.namespace).toMatchInlineSnapshot('"namespace"');
    expect(resourceId.name).toMatchInlineSnapshot('"name"');
    expect(resourceId.type).toMatchInlineSnapshot('"name"');
  });
});
