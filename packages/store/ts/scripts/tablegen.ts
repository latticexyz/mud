import path from "path";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { Store as StoreConfig } from "../config/v2/output";

const configPath = await resolveConfigPath(undefined);
const config = (await loadConfig(configPath)) as StoreConfig;
const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen({
  configPath,
  config,
  outputBaseDirectory: path.join(srcDir, config.codegen.outputDirectory),
  remappings,
});
