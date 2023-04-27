import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { storeConfig, zStoreConfig, StoreUserConfig } from "./parseStoreConfig";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<StoreUserConfig>().toEqualTypeOf<z.input<typeof zStoreConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<StoreUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<StoreUserConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof zStoreConfig>>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them

  // Test possible inference confusion.
  // This would fail if you remove `AsDependent` from `StoreUserConfig`
  expectTypeOf(
    storeConfig({
      tables: {
        Table1: {
          primaryKeys: {
            a: "Enum1",
          },
          schema: {
            b: "Enum2",
          },
        },
        Table2: {
          schema: {
            a: "uint32",
          },
        },
      },
      enums: {
        Enum1: ["E1"],
        Enum2: ["E1"],
      },
    })
  ).toEqualTypeOf<StoreUserConfig<"Enum1" | "Enum2", "Enum1" | "Enum2">>();
});
