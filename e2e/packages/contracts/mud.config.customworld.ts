import { defineWorld } from "@latticexyz/world";
import { rawMudConfig } from "./mud.config";

export default defineWorld({
  ...rawMudConfig,
  deploy: {
    customWorld: {
      sourcePath: "src/CustomWorld.sol",
      name: "CustomWorld",
    },
  },
});
