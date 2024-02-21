import { withWorldConfig, WorldConfigInput } from "@latticexyz/world";
import { withStoreConfig } from "@latticexyz/store";

const defineConfig = <configInput extends WorldConfigInput>(
  configInput: configInput
): withStoreConfig<withWorldConfig<configInput>> => {
  return withStoreConfig(withWorldConfig(configInput));
};

const config = defineConfig({
  namespaces: { testNamespace: { name: "testNamespaceName" } },
  tables: { testTable: { name: "testNameTable" } },
} as const);
