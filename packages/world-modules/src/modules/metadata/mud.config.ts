import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "metadata",
  sourceDirectory: ".",
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    Resource: {
      schema: {
        resource: "ResourceId",
        name: "bytes32",
        value: "string",
      },
      key: ["resource", "name"],
    },
  },
});
