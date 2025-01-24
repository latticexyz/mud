import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    CallWithSignatureNonces: {
      schema: { signer: "address", nonce: "uint256" },
      key: ["signer"],
    },
  },
});
