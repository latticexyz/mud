import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getRemappings } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { Store as StoreConfig } from "../config/v2/output";

const configPath = await resolveConfigPath(undefined);
const config = (await loadConfig(configPath)) as StoreConfig;
const remappings = await getRemappings();

await tablegen({
  configPath,
  config,
  remappings,
});
