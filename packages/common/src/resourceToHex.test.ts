import { describe, it, expect } from "vitest";
import { resourceToHex } from "./resourceToHex";
import { hexToResource } from "./hexToResource";

describe("resourceToHex", () => {
  it("can convert table resource to hex string", () => {
    const hex = resourceToHex({
      type: "table",
      namespace: "namespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x74626e616d65737061636500000000006e616d65000000000000000000000000"');
    expect(hexToResource(hex)).toMatchInlineSnapshot(`
      {
        "hex": "0x74626e616d65737061636500000000006e616d65000000000000000000000000",
        "name": "name",
        "namespace": "namespace",
        "type": "table",
      }
    `);
  });

  it("can convert offchain table resource to hex string", () => {
    const hex = resourceToHex({
      type: "offchainTable",
      namespace: "namespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x6f746e616d65737061636500000000006e616d65000000000000000000000000"');
    expect(hexToResource(hex)).toMatchInlineSnapshot(`
      {
        "hex": "0x6f746e616d65737061636500000000006e616d65000000000000000000000000",
        "name": "name",
        "namespace": "namespace",
        "type": "offchainTable",
      }
    `);
  });

  it("truncates namespaces >14 bytes", () => {
    const hex = resourceToHex({
      type: "table",
      namespace: "AVeryLongNamespace",
      name: "name",
    });
    expect(hex).toMatchInlineSnapshot('"0x746241566572794c6f6e674e616d65736e616d65000000000000000000000000"');
    expect(hexToResource(hex)).toMatchInlineSnapshot(`
      {
        "hex": "0x746241566572794c6f6e674e616d65736e616d65000000000000000000000000",
        "name": "name",
        "namespace": "AVeryLongNames",
        "type": "table",
      }
    `);
  });

  it("truncates names >16 bytes", () => {
    const hex = resourceToHex({
      type: "table",
      namespace: "namespace",
      name: "AnUnnecessarilyLongName",
    });
    expect(hex).toMatchInlineSnapshot('"0x74626e616d6573706163650000000000416e556e6e65636573736172696c794c"');
    expect(hexToResource(hex)).toMatchInlineSnapshot(`
      {
        "hex": "0x74626e616d6573706163650000000000416e556e6e65636573736172696c794c",
        "name": "AnUnnecessarilyL",
        "namespace": "namespace",
        "type": "table",
      }
    `);
  });
});
