import path from "path";
import { loadConfig } from "@latticexyz/config/library";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen, StoreConfig } from "../library";

const config = (await loadConfig()) as StoreConfig;
const srcDir = await getSrcDirectory();

await tablegen(config, path.join(srcDir, config.codegenDirectory));
