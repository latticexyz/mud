import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  namespace: "LastCall",
  tables: {
    LastCall: {
      schema: {
        caller: "address",
        callTime: "uint256",
        sender: "address",
      },
      key: ["caller"],
    },
  },
});
