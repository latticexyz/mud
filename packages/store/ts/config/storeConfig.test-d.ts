import { MergedPluginsInput } from "@latticexyz/config";
import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { storePlugin } from "./plugin";
import { zStoreConfig, StoreUserConfig, MUDUserConfig } from "./storeConfig";

type MockMUDUserConfig = MUDUserConfig<Record<string, never>, Record<string, unknown>>;

describe("StoreUserConfig", () => {
  // Check that the plugin uses the correct type
  expectTypeOf<
    Omit<MergedPluginsInput<{ storePlugin: typeof storePlugin }>, "plugins">
  >().toEqualTypeOf<StoreUserConfig>();

  // Typecheck manual interfaces against zod
  expectTypeOf<StoreUserConfig>().toMatchTypeOf<MockMUDUserConfig>();
  expectTypeOf<MockMUDUserConfig>().toMatchTypeOf<StoreUserConfig>();

  // type equality isn't deep for optionals
  expectTypeOf<StoreUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<MockMUDUserConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<StoreUserConfig>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them
});
