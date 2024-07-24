import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { defineNamespaces } from "./namespaces";

describe("defineNamespaces", () => {
  it("should throw on duplicates", () => {
    attest(() =>
      defineNamespaces({
        First: { namespace: "app" },
        Second: { namespace: "app" },
      }),
    ).throws("Found namespaces defined more than once in config: app");
  });
});
