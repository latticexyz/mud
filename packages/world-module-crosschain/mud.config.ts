import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "root",
  tables: {
    CrosschainRecordMetadata: {
      schema: {
        // keccak256(abi.encodePacked(tableId, keyTuple))
        recordId: "bytes32",
        blockNumber: "uint256",
        logIndex: "uint256",
        timestamp: "uint256",
        chainId: "uint256",
      },
      key: ["recordId"],
    },
  },
});
