import path from "path";
import { configgen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import config from "./test-config";

const srcDirectory = await getSrcDirectory();

if (config !== undefined) {
  configgen(config, path.join(srcDirectory, config.codegenDirectory));
} else {
  process.exit(1);
}
