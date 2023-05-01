import path from "path";
import { loadConfig, MUDCoreConfig } from "@latticexyz/config";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store";

const config = (await loadConfig()) as MUDCoreConfig;
const srcDir = await getSrcDirectory();

await tablegen(config, path.join(srcDir, config.codegenDirectory));
