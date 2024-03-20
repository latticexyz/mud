import { defineWorld } from "@latticexyz/world";

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
