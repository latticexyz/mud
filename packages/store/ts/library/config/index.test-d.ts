import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { zStoreConfig, MUDUserConfig } from ".";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<MUDUserConfig>().toEqualTypeOf<z.input<typeof zStoreConfig>>();

  // type equality isn't deep for optionals
  expectTypeOf<MUDUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<MUDUserConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof zStoreConfig>>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them
});
