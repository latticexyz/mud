import { describe, it } from "vitest";
import { attest } from "@ark/attest";
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
      systemId: resourceToHex({ type: "system", namespace: "", name: "ExampleSystem" }),
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
      systemId: resourceToHex({ type: "system", namespace: "", name: "ExampleSystem" }),
    } as const;

    attest<typeof expected>(system).equals(expected);
  });

  it("should allow setting openAccess to false", () => {
    const system = defineSystem({
      label: "ExampleSystem",
      openAccess: false,
    });

    const expected = {
      ...SYSTEM_DEFAULTS,
      label: "ExampleSystem",
      namespace: "",
      name: "ExampleSystem" as string,
      systemId: resourceToHex({ type: "system", namespace: "", name: "ExampleSystem" }),
      openAccess: false,
    } as const;

    attest<typeof expected>(system).equals(expected);
  });

  it("should throw if system config is missing required keys", () => {
    // TODO: runtime validation error?
    attest(() =>
      // @ts-expect-error Property 'label' is missing in type
      defineSystem({}),
    ).type.errors("Property 'label' is missing in type");
  });
});
