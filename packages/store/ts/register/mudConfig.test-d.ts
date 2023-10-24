import { describe, expectTypeOf } from "vitest";
import { mudConfig } from ".";
import { Hex } from "viem";

describe("mudConfig", () => {
  // Test possible inference confusion.
  // This would fail if you remove `AsDependent` from `MUDUserConfig`
  expectTypeOf<
    ReturnType<
      typeof mudConfig<{
        enums: {
          Enum1: ["E1"];
          Enum2: ["E1"];
        };
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
    resolvedTables: {
      Table1: {
        tableId: Hex;
        namespace: "";
        name: "Table1";
        keySchema: {
          a: "uint8";
        };
        valueSchema: {
          b: "uint8";
        };
      };
      Table2: {
        tableId: Hex;
        namespace: "";
        name: "Table1";
        keySchema: {
          key: "bytes32";
        };
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
