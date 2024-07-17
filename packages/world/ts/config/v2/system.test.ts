import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import { defineSystem } from "./system";
import { SYSTEM_DEFAULTS } from "./defaults";

describe("resolveSystem", () => {
  it("should return a full system definition", () => {
    const system = defineSystem({
      label: "ExampleSystem",
    });

    const expected = {
      ...SYSTEM_DEFAULTS,
      label: "ExampleSystem",
      namespace: "",
      name: "ExampleSystem" as string,
      tableId: resourceToHex({ type: "table", namespace: "", name: "ExampleSystem" }),
    } as const;

    attest<typeof expected>(system).equals(expected);
  });

  it("should default undefined values", () => {
    const system = defineSystem({
      label: "ExampleSystem",
      openAccess: undefined,
    });

    const expected = {
      ...SYSTEM_DEFAULTS,
      label: "ExampleSystem",
      namespace: "",
      name: "ExampleSystem" as string,
      tableId: resourceToHex({ type: "table", namespace: "", name: "ExampleSystem" }),
    } as const;

    attest<typeof expected>(system).equals(expected);
  });

  it("should throw if system config is missing required keys", () => {
    attest(() =>
      // @ts-expect-error Property 'label' is missing in type
      defineSystem({}),
    ).type.errors("Property 'label' is missing in type");
  });
});
