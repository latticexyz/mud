import path from "path";
import { loadStoreConfig } from "@latticexyz/config";
import { tablegen } from "../render-solidity";

const config = await loadStoreConfig();
// TODO extract `foundry.ts` from the cli package and use its `getSrcDirectory` here
const srcDir = "./src";

tablegen(config, path.join(srcDir, config.codegenDirectory));
