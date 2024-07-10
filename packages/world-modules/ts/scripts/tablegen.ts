import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getRemappings } from "@latticexyz/common/foundry";
import { Store as StoreConfig } from "@latticexyz/store";
import { tablegen } from "@latticexyz/store/codegen";
import path from "node:path";

const configPath = await resolveConfigPath();
const config = (await loadConfig(configPath)) as StoreConfig;
const remappings = await getRemappings();

await tablegen({ rootDir: path.dirname(configPath), config, remappings });
