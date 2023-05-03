import path from "path";
import { loadConfig, MUDCoreConfig } from "@latticexyz/config/library";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store/library";
// register MUD config and its store extension to get store types
import "@latticexyz/store/register";

const config = (await loadConfig()) as MUDCoreConfig;
const srcDir = await getSrcDirectory();

await tablegen(config, path.join(srcDir, config.codegenDirectory));
