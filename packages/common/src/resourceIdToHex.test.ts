import { describe, it, expect } from "vitest";
import { resourceIdToHex } from "./resourceIdToHex";
import { hexToResourceId } from "./hexToResourceId";

describe("resourceIdToHex", () => {
  it("can convert table resource to hex string", () => {
    const hex = resourceIdToHex({
      type: "table",
      namespace: "namespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x6e616d65737061636500000000006e616d650000000000000000000000007462"');
    expect(hexToResourceId(hex)).toMatchInlineSnapshot(`
      {
        "name": "name",
        "namespace": "namespace",
        "type": "table",
      }
    `);
  });

  it("can convert offchain table resource to hex string", () => {
    const hex = resourceIdToHex({
      type: "offchainTable",
      namespace: "namespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x6e616d65737061636500000000006e616d650000000000000000000000006f74"');
    expect(hexToResourceId(hex)).toMatchInlineSnapshot(`
      {
        "name": "name",
        "namespace": "namespace",
        "type": "offchainTable",
      }
    `);
  });

  it("truncates namespaces >14 bytes", () => {
    const hex = resourceIdToHex({
      type: "table",
      namespace: "AVeryLongNamespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x41566572794c6f6e674e616d65736e616d650000000000000000000000007462"');
    expect(hexToResourceId(hex)).toMatchInlineSnapshot(`
      {
        "name": "name",
        "namespace": "AVeryLongNames",
        "type": "table",
      }
    `);
  });

  it("truncates names >16 bytes", () => {
    const hex = resourceIdToHex({
      type: "table",
      namespace: "namespace",
      name: "AnUnnecessarilyLongName",
    });
    expect(hex).toMatchInlineSnapshot('"0x6e616d6573706163650000000000416e556e6e65636573736172696c794c7462"');
    expect(hexToResourceId(hex)).toMatchInlineSnapshot(`
      {
        "name": "AnUnnecessarilyL",
        "namespace": "namespace",
        "type": "table",
      }
    `);
  });
});
