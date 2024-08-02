import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "app",
  tables: {
    Checked: "bool",

    Counter: {
      schema: {
        value: "uint32",
      },
      key: [],
    },

    OffchainCounter: {
      schema: {
        value: "uint32",
      },
      key: [],
      type: "offchainTable",
    },

    Tasks: {
      schema: {
        id: "bytes32",
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
      key: ["id"],
    },

    Checkboxes: {
      schema: {
        checkboxId: "bytes32",
        checked: "bool",
      },
      key: ["checkboxId"],
    },
  },
});
