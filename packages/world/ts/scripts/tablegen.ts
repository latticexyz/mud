import path from "path";
import { loadStoreConfig } from "@latticexyz/config";
import { tablegen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";

const config = await loadStoreConfig();
const srcDir = await getSrcDirectory();

tablegen(config, path.join(srcDir, config.codegenDirectory));
