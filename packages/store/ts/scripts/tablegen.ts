import path from "path";
import { loadConfig } from "@latticexyz/config";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../render-solidity";
import { MUDConfig } from "../config/parseStoreConfig";

const config = (await loadConfig()) as MUDConfig;
const srcDir = await getSrcDirectory();

await tablegen(config, path.join(srcDir, config.codegenDirectory));
