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
    SystemboundDelegations: {
      directory: "modules/std-delegations/tables",
      keySchema: {
        delegator: "address",
        delegatee: "address",
        systemId: "ResourceId",
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
     *    PUPPET MODULE
     *
     ************************************************************************/
    PuppetRegistry: {
      directory: "modules/puppet/tables",
      keySchema: {
        systemId: "ResourceId",
      },
      valueSchema: {
        puppet: "address",
      },
      tableIdArgument: true,
    },
    /************************************************************************
     *
     *    TOKEN TABLES (SHARED BY ERC20, ERC721)
     *
     ************************************************************************/
    Balances: {
      directory: "modules/tokens/tables",
      keySchema: {
        account: "address",
      },
      valueSchema: {
        value: "uint256",
      },
      tableIdArgument: true,
    },
    /************************************************************************
     *
     *    ERC20 MODULE
     *
     ************************************************************************/
    ERC20Metadata: {
      directory: "modules/erc20-puppet/tables",
      keySchema: {},
      valueSchema: {
        decimals: "uint8",
        name: "string",
        symbol: "string",
      },
      tableIdArgument: true,
    },
    Allowances: {
      directory: "modules/erc20-puppet/tables",
      keySchema: {
        account: "address",
        spender: "address",
      },
      valueSchema: {
        value: "uint256",
      },
      tableIdArgument: true,
    },
    TotalSupply: {
      directory: "modules/erc20-puppet/tables",
      keySchema: {},
      valueSchema: {
        totalSupply: "uint256",
      },
      tableIdArgument: true,
    },
    ERC20Registry: {
      directory: "modules/erc20-puppet/tables",
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        tokenAddress: "address",
      },
      tableIdArgument: true,
    },
    /************************************************************************
     *
     *    ERC721 MODULE
     *
     ************************************************************************/
    ERC721Metadata: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {},
      valueSchema: {
        name: "string",
        symbol: "string",
        baseURI: "string",
      },
      tableIdArgument: true,
    },
    TokenURI: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {
        tokenId: "uint256",
      },
      valueSchema: {
        tokenURI: "string",
      },
      tableIdArgument: true,
    },
    Owners: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {
        tokenId: "uint256",
      },
      valueSchema: {
        owner: "address",
      },
      tableIdArgument: true,
    },
    TokenApproval: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {
        tokenId: "uint256",
      },
      valueSchema: {
        account: "address",
      },
      tableIdArgument: true,
    },
    OperatorApproval: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {
        owner: "address",
        operator: "address",
      },
      valueSchema: {
        approved: "bool",
      },
      tableIdArgument: true,
    },
    ERC721Registry: {
      directory: "modules/erc721-puppet/tables",
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        tokenAddress: "address",
      },
      tableIdArgument: true,
    },
  },
  excludeSystems: ["UniqueEntitySystem", "PuppetFactorySystem", "ERC20System", "ERC721System"],
});
