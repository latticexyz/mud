import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "LastCall",
  tables: {
    LastCall: {
      keySchema: {
        caller: "address",
      },
      valueSchema: {
        callTime: "uint256",
        sender: "address",
      },
    },
  },
});
