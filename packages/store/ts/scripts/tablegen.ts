import path from "path";
import { loadConfig } from "@latticexyz/config/node";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { StoreConfig } from "..";

const config = (await loadConfig()) as StoreConfig;
const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegenDirectory), remappings);
