import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "metadata",
  codegen: {
    generateSystemLibraries: true,
    // generate into experimental dir until these are stable/audited
    systemLibrariesDirectory: "experimental/systems",
  },
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    ResourceTag: {
      schema: {
        resource: "ResourceId",
        tag: "bytes32",
        value: "bytes",
      },
      key: ["resource", "tag"],
    },
  },
});
