import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  codegen: {
    generateSystemLibraries: true,
    // generate into experimental dir until these are stable/audited
    systemLibrariesDirectory: "experimental/systems",
  },
  systems: {
    BatchStoreSystem: {
      deploy: {
        disabled: true,
        registerWorldFunctions: false,
      },
    },
  },
});
