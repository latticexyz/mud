import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { tablegen } from "../codegen";
import { Store as StoreConfig } from "../config/v2/output";
import path from "node:path";

const configPath = await resolveConfigPath(undefined);
const config = (await loadConfig(configPath)) as StoreConfig;

await tablegen({ rootDir: path.dirname(configPath), config });
