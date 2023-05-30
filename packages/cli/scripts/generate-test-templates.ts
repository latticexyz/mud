import path from "path";
import { templategen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import config from "./test-config";
import { templateConfig } from "../contracts/src/codegen/template";

const factoryConfig = templateConfig({
  Example: {
    Statics: {
      v1: 1n,
      v2: 1,
      v3: "0x0123",
      v4: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      v5: true,
      v6: "E1",
      v7: "E1",
    },
  },
});

const srcDirectory = await getSrcDirectory();

if (config !== undefined) {
  templategen(config, factoryConfig, path.join(srcDirectory, config.codegenDirectory));
} else {
  process.exit(1);
}
