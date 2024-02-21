import { afterAll, beforeAll, describe, it } from "vitest";
import { resolveTableConfig, TableKeysConfigInput } from "./resolveTableConfig";
import { setup, cleanup, attest } from "@arktype/attest";

describe("resolveTableConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });

  describe("TableKeysConfigInput", () => {
    attest(() => {
      const invalidKeys: TableKeysConfigInput<{ x: "uint256"; y: "uint256" }> = ["invalidKey"];
    }).type.errors(`Type '"invalidKey"' is not assignable to type '"x" | "y"'.`);

    const validKeys: TableKeysConfigInput<{ x: "uint256"; y: "uint256" }> = ["x"];
  });
});
