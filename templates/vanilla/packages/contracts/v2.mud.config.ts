import { withWorldConfig, WorldConfigInput } from "@latticexyz/world";
import { resolveStoreConfig } from "@latticexyz/store";

const resolveConfig = <configInput extends WorldConfigInput>(
  configInput: configInput
): resolveStoreConfig<withWorldConfig<configInput>> => {
  return resolveStoreConfig(withWorldConfig(configInput));
};

const config = resolveConfig({
  namespaces: { testNamespace: { name: "testNamespaceName" } },
  tables: { testTable: { name: "testNameTable" } },
} as const);
