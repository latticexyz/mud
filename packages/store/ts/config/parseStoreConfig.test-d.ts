import { MUDCoreUserConfig, MUDPlugin } from "@latticexyz/config";
import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { mudConfig, zStoreConfig, MUDUserConfig, storePlugin, MUDConfig } from "./parseStoreConfig";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<MUDUserConfig["plugins"]>().toEqualTypeOf<z.input<typeof zStoreConfig>["plugins"]>();

  // type equality isn't deep for optionals
  expectTypeOf<MUDUserConfig["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<MUDUserConfig["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof zStoreConfig>>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them

  // Test possible inference confusion.
  // This would fail if you remove `AsDependent` from `MUDUserConfig`
  expectTypeOf(
    mudConfig({
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
      plugins: [storePlugin],
    })
  ).toEqualTypeOf<MUDConfig<"Enum1" | "Enum2", "Enum1" | "Enum2">>();
});
