import path from "path";
import { loadConfig } from "@latticexyz/config/library";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { StoreConfig, tablegen } from "@latticexyz/store/library";

const config = (await loadConfig()) as StoreConfig;
const srcDir = await getSrcDirectory();

await tablegen(config, path.join(srcDir, config.codegenDirectory));
