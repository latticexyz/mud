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
            chainId: "uint256",
            tableId: "ResourceId",
            keyHash: "bytes32",
            blockNumber: "uint256",
            timestamp: "uint256",
          },
          key: ["chainId", "tableId", "keyHash"],
        },
      },
    },
  },
  codegen: {
    generateSystemLibraries: true,
  },
});
