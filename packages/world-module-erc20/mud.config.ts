import { defineStore } from "@latticexyz/store";

// Used for tablegen
export default defineStore({
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    Owner: {
      schema: {
        value: "address",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    ERC20Metadata: {
      schema: {
        decimals: "uint8",
        name: "string",
        symbol: "string",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    TotalSupply: {
      schema: {
        totalSupply: "uint256",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    Balances: {
      schema: {
        account: "address",
        value: "uint256",
      },
      key: ["account"],
      codegen: {
        tableIdArgument: true,
      },
    },
    Allowances: {
      schema: {
        account: "address",
        spender: "address",
        value: "uint256",
      },
      key: ["account", "spender"],
      codegen: {
        tableIdArgument: true,
      },
    },
    Paused: {
      schema: {
        paused: "bool",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    ERC20Registry: {
      schema: {
        namespaceId: "ResourceId",
        tokenAddress: "address",
      },
      key: ["namespaceId"],
      codegen: {
        tableIdArgument: true,
      },
    },
  },
});
