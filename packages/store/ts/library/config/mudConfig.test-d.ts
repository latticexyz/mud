import { describe, expectTypeOf } from "vitest";
import { mudConfig, TABLE_DEFAULTS } from ".";
import { storePlugin } from "./plugin";

type AutoExpandedConfig = ReturnType<
  typeof mudConfig<
    { storePlugin: typeof storePlugin },
    {
      tables: {
        Table1: {
          keySchema: {
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
    }
  >
>;

type ManuallyExpandedConfig = {
  enums: {
    Enum1: ["E1"];
    Enum2: ["E1"];
  };
  tables: {
    Table1: {
      keySchema: {
        a: "Enum1";
      };
      schema: {
        b: "Enum2";
      };
      directory: typeof TABLE_DEFAULTS.directory;
      name: "Table1";
      tableIdArgument: typeof TABLE_DEFAULTS.tableIdArgument;
      storeArgument: typeof TABLE_DEFAULTS.storeArgument;
      dataStruct: boolean;
      ephemeral: typeof TABLE_DEFAULTS.ephemeral;
    };
    Table2: {
      schema: {
        a: "uint32";
      };
      directory: typeof TABLE_DEFAULTS.directory;
      name: "Table2";
      tableIdArgument: typeof TABLE_DEFAULTS.tableIdArgument;
      storeArgument: typeof TABLE_DEFAULTS.storeArgument;
      dataStruct: boolean;
      keySchema: typeof TABLE_DEFAULTS.keySchema;
      ephemeral: typeof TABLE_DEFAULTS.ephemeral;
    };
  };
  namespace: "";
  storeImportPath: "@latticexyz/store/src/";
  userTypesPath: "Types";
  codegenDirectory: "codegen";
};

const _test1: AutoExpandedConfig = {} as ManuallyExpandedConfig;
// TODO fix weak types
const _test2: ManuallyExpandedConfig = {} as AutoExpandedConfig;

describe("mudConfig", () => {
  // Test possible inference confusion.
  // This would fail if you remove `AsDependent` from `MUDUserConfig`
  expectTypeOf<AutoExpandedConfig>().toEqualTypeOf<ManuallyExpandedConfig>();
});
