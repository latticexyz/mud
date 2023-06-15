import { MergedPluginsInput } from "@latticexyz/config";
import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { storePlugin } from "./plugin";
import { zStoreConfig, StoreUserConfig } from "./storeConfig";

describe("StoreUserConfig", () => {
  // Check that the plugin uses the correct type
  expectTypeOf<
    Omit<MergedPluginsInput<{ storePlugin: typeof storePlugin }>, "plugins">
  >().toEqualTypeOf<StoreUserConfig>();

  // Typecheck manual interfaces against zod
  expectTypeOf<StoreUserConfig>().toEqualTypeOf<z.input<typeof zStoreConfig>>();

  // type equality isn't deep for optionals
  expectTypeOf<StoreUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<StoreUserConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof zStoreConfig>>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them
});
