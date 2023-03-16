import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { StoreConfig, StoreUserConfig, UserTypesConfig } from "./parseStoreConfig.js";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<StoreUserConfig>().toEqualTypeOf<z.input<typeof StoreConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<StoreUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof StoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<UserTypesConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<UserTypesConfig>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them
});
