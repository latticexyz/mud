import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { zStoreConfig } from "./expandConfig";
import { defineStoreConfig } from "./defineStoreConfig";
import { Config } from "./types";

describe("StoreUserConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<Config>().toEqualTypeOf<z.input<typeof zStoreConfig>>();

  // type equality isn't deep for optionals
  expectTypeOf<Config["tables"][string]>().toEqualTypeOf<z.input<typeof zStoreConfig>["tables"][string]>();
  expectTypeOf<NonNullable<Config["enums"]>[string]>().toEqualTypeOf<
    NonNullable<NonNullable<z.input<typeof zStoreConfig>>["enums"]>[string]
  >();
  // TODO If more nested schemas are added, provide separate tests for them

  // Test strong types.
  // This would fail if you remove `AsDependent` from `MUDUserConfig`
  expectTypeOf(
    defineStoreConfig({
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
  ).toEqualTypeOf<{
    tables: {
      Table1: {
        primaryKeys: {
          a: "Enum1";
        };
        schema: {
          b: "Enum2";
        };
      };
      Table2: {
        schema: {
          a: "uint32";
        };
      };
    };
    enums: {
      Enum1: string[]; // No strong inference for enum array values, since ZOD does not support "readonly" arrays
      Enum2: string[];
    };
  }>();
});
