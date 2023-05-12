// TODO: using mudConfig breaks the ability to import this in the browser
// import { mudConfig } from "@latticexyz/world/register";
import { resolveTableId } from "@latticexyz/config";
import { MUDUserConfig } from "@latticexyz/store";
import { ExpandMUDUserConfig } from "@latticexyz/store/register";

function defineConfig<T extends MUDUserConfig>(config: T): ExpandMUDUserConfig<T> {
  return config as any;
}

export default defineConfig({
  overrideSystems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
  },
  tables: {
    CounterTable: {
      name: "counter",
      schema: {
        value: "uint32",
      },
      storeArgument: true,
    },
    MessageTable: {
      primaryKeys: {},
      schema: {
        value: "string",
      },
      ephemeral: true,
    },
    TestTable: {
      primaryKeys: {
        first: "uint160",
        second: "address",
        third: "bytes20",
      },
      schema: { value: "uint64" },
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
  ],
});
