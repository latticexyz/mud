import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  worldgenDirectory: "interfaces",
  worldInterfaceName: "IBaseWorld",
  codegenDirectory: ".",
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", internalType: "bytes32" },
  },
  tables: {
    /************************************************************************
     *
     *    KEYS WITH VALUE MODULE
     *
     ************************************************************************/
    KeysWithValue: {
      directory: "modules/keyswithvalue/tables",
      keySchema: {
        valueHash: "bytes32",
      },
      valueSchema: {
        keysWithValue: "bytes32[]", // For now only supports 1 key per value
      },
      tableIdArgument: true,
      storeArgument: true,
    },
    /************************************************************************
     *
     *    KEYS IN TABLE MODULE
     *
     ************************************************************************/
    KeysInTable: {
      directory: "modules/keysintable/tables",
      keySchema: { sourceTableId: "ResourceId" },
      valueSchema: {
        keys0: "bytes32[]",
        keys1: "bytes32[]",
        keys2: "bytes32[]",
        keys3: "bytes32[]",
        keys4: "bytes32[]",
      },
      storeArgument: true,
    },
    UsedKeysIndex: {
      directory: "modules/keysintable/tables",
      keySchema: {
        sourceTableId: "ResourceId",
        keysHash: "bytes32",
      },
      valueSchema: { has: "bool", index: "uint40" },
      dataStruct: false,
      storeArgument: true,
    },
    /************************************************************************
     *
     *    UNIQUE ENTITY MODULE
     *
     ************************************************************************/
    UniqueEntity: {
      directory: "modules/uniqueentity/tables",
      keySchema: {},
      valueSchema: "uint256",
      tableIdArgument: true,
      storeArgument: true,
    },
    /************************************************************************
     *
     *    STD DELEGATIONS MODULE
     *
     ************************************************************************/
    CallboundDelegations: {
      directory: "modules/std-delegations/tables",
      keySchema: {
        delegator: "address",
        delegatee: "address",
        systemId: "ResourceId",
        callDataHash: "bytes32",
      },
      valueSchema: {
        availableCalls: "uint256",
      },
    },
    TimeboundDelegations: {
      directory: "modules/std-delegations/tables",
      keySchema: {
        delegator: "address",
        delegatee: "address",
      },
      valueSchema: {
        maxTimestamp: "uint256",
      },
    },
    /************************************************************************
     *
     *    ERC20 MODULE
     *
     ************************************************************************/
    Balances: {
      keySchema: {
        account: "address",
      },
      valueSchema: {
        value: "uint256",
      },
    },
    Allowances: {
      keySchema: {
        account: "address",
        spender: "address",
      },
      valueSchema: {
        value: "uint256",
      },
    },
    Metadata: {
      keySchema: {},
      valueSchema: {
        totalSupply: "uint256",
        name: "string",
        symbol: "string",
      },
    },
  },

  excludeSystems: ["UniqueEntitySystem"],
});
