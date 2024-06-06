import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getRemappings } from "@latticexyz/common/foundry";
import { Store as StoreConfig } from "@latticexyz/store";
import { tablegen } from "@latticexyz/store/codegen";

const configPath = await resolveConfigPath(undefined);
const config = (await loadConfig(configPath)) as StoreConfig;
const remappings = await getRemappings();

await tablegen({
  configPath,
  config,
  remappings,
});
