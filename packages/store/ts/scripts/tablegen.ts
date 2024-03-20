import path from "path";
import { loadConfig } from "@latticexyz/config/node";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { Store as StoreConfig } from "../config/v2/output";

const config = (await loadConfig()) as StoreConfig;
const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegen.outputDirectory), remappings);
