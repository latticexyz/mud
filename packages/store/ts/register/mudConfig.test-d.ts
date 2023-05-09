import { describe, expectTypeOf } from "vitest";
import { mudConfig } from ".";

describe("mudConfig", () => {
  // Test possible inference confusion.
  // This would fail if you remove `AsDependent` from `MUDUserConfig`
  expectTypeOf<
    ReturnType<
      typeof mudConfig<{
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
          Enum1: ["E1"];
          Enum2: ["E1"];
        };
      }>
    >
  >().toEqualTypeOf<{
    enums: {
      Enum1: ["E1"];
      Enum2: ["E1"];
    };
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
    namespace: "";
    storeImportPath: "@latticexyz/store/src/";
    userTypesPath: "Types";
    codegenDirectory: "codegen";
  }>();
});
