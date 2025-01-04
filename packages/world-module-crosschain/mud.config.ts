import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  userTypes: {
    ResourceId: {
      type: "bytes32",
      filePath: "@latticexyz/store/src/ResourceId.sol",
    },
  },
  namespaces: {
    root: {
      namespace: "",
    },
    crosschain: {
      tables: {
        CrosschainRecord: {
          schema: {
            tableId: "ResourceId",
            keyHash: "bytes32",
            blockNumber: "uint256",
            timestamp: "uint256",
            owned: "bool",
          },
          key: ["tableId", "keyHash"],
        },
      },
    },
  },
  codegen: {
    generateSystemLibraries: true,
  },
});
