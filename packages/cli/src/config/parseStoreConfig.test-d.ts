import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { PrototypeConfig, StoreConfig, StoreUserConfig } from "./parseStoreConfig.js";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<StoreUserConfig>().toEqualTypeOf<z.input<typeof StoreConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<StoreUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof StoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<NonNullable<StoreUserConfig["userTypes"]>["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof StoreConfig>["userTypes"]>["enums"]>[string]
  >();
  expectTypeOf<PrototypeConfig>().toEqualTypeOf<z.input<typeof PrototypeConfig>>();
  expectTypeOf<PrototypeConfig["tables"][string]>().toEqualTypeOf<z.input<typeof PrototypeConfig>["tables"][string]>();
  // TODO If more nested schemas are added, provide separate tests for them
});
