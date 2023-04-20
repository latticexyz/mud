import path from "path";
import { loadStoreConfig } from "@latticexyz/config";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../render-solidity";

const config = await loadStoreConfig();
const srcDir = await getSrcDirectory();

tablegen(config, path.join(srcDir, config.codegenDirectory));
