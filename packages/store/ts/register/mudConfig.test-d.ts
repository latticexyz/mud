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
            keySchema: {
              a: "Enum1";
            };
            valueSchema: {
              b: "Enum2";
            };
          };
          Table2: {
            valueSchema: {
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
    userTypes: Record<string, never>;
    tables: {
      Table1: {
        keySchema: {
          a: "Enum1";
        };
        valueSchema: {
          b: "Enum2";
        };
      };
      Table2: {
        valueSchema: {
          a: "uint32";
        };
      };
    };
    namespace: "";
    storeImportPath: "@latticexyz/store/src/";
    userTypesFilename: "common.sol";
    codegenDirectory: "codegen";
    codegenIndexFilename: "index.sol";
  }>();
});
