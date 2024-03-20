import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  codegen: {
    worldgenDirectory: "interfaces",
    worldInterfaceName: "IBaseWorld",
    codegenDirectory: ".",
  },
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    /************************************************************************
     *
     *    KEYS WITH VALUE MODULE
     *
     ************************************************************************/
    KeysWithValue: {
      schema: {
        valueHash: "bytes32",
        keysWithValue: "bytes32[]", // For now only supports 1 key per value
      },
      key: ["valueHash"],
      codegen: {
        directory: "modules/keyswithvalue/tables",
        tableIdArgument: true,
        storeArgument: true,
      },
    },
    /************************************************************************
     *
     *    KEYS IN TABLE MODULE
     *
     ************************************************************************/
    KeysInTable: {
      schema: {
        sourceTableId: "ResourceId",
        keys0: "bytes32[]",
        keys1: "bytes32[]",
        keys2: "bytes32[]",
        keys3: "bytes32[]",
        keys4: "bytes32[]",
      },
      key: ["sourceTableId"],
      codegen: {
        directory: "modules/keysintable/tables",
        storeArgument: true,
      },
    },
    UsedKeysIndex: {
      schema: {
        sourceTableId: "ResourceId",
        keysHash: "bytes32",
        has: "bool",
        index: "uint40",
      },
      key: ["sourceTableId", "keysHash"],
      codegen: {
        directory: "modules/keysintable/tables",
        dataStruct: false,
        storeArgument: true,
      },
    },
    /************************************************************************
     *
     *    UNIQUE ENTITY MODULE
     *
     ************************************************************************/
    UniqueEntity: {
      schema: {
        value: "uint256",
      },
      key: [],
      codegen: {
        directory: "modules/uniqueentity/tables",
        tableIdArgument: true,
        storeArgument: true,
      },
    },
    /************************************************************************
     *
     *    STD DELEGATIONS MODULE
     *
     ************************************************************************/
    CallboundDelegations: {
      schema: {
        delegator: "address",
        delegatee: "address",
        systemId: "ResourceId",
        callDataHash: "bytes32",
        availableCalls: "uint256",
      },
      key: ["delegator", "delegatee", "systemId", "callDataHash"],
      codegen: {
        directory: "modules/std-delegations/tables",
      },
    },
    SystemboundDelegations: {
      schema: {
        delegator: "address",
        delegatee: "address",
        systemId: "ResourceId",
        availableCalls: "uint256",
      },
      key: ["delegator", "delegatee", "systemId"],
      codegen: {
        directory: "modules/std-delegations/tables",
      },
    },
    TimeboundDelegations: {
      schema: {
        delegator: "address",
        delegatee: "address",
        maxTimestamp: "uint256",
      },
      key: ["delegator", "delegatee"],
      codegen: {
        directory: "modules/std-delegations/tables",
      },
    },
    /************************************************************************
     *
     *    PUPPET MODULE
     *
     ************************************************************************/
    PuppetRegistry: {
      schema: {
        systemId: "ResourceId",
        puppet: "address",
      },
      key: ["systemId"],
      codegen: {
        directory: "modules/puppet/tables",
        tableIdArgument: true,
      },
    },
    /************************************************************************
     *
     *    TOKEN TABLES (SHARED BY ERC20, ERC721)
     *
     ************************************************************************/
    Balances: {
      schema: {
        account: "address",
        value: "uint256",
      },
      key: ["account"],
      codegen: {
        directory: "modules/tokens/tables",
        tableIdArgument: true,
      },
    },
    /************************************************************************
     *
     *    ERC20 MODULE
     *
     ************************************************************************/
    ERC20Metadata: {
      schema: {
        decimals: "uint8",
        name: "string",
        symbol: "string",
      },
      key: [],
      codegen: {
        directory: "modules/erc20-puppet/tables",
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
        directory: "modules/erc20-puppet/tables",
        tableIdArgument: true,
      },
    },
    TotalSupply: {
      schema: {
        totalSupply: "uint256",
      },
      key: [],
      codegen: {
        directory: "modules/erc20-puppet/tables",
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
        directory: "modules/erc20-puppet/tables",
        tableIdArgument: true,
      },
    },
    /************************************************************************
     *
     *    ERC721 MODULE
     *
     ************************************************************************/
    ERC721Metadata: {
      schema: {
        name: "string",
        symbol: "string",
        baseURI: "string",
      },
      key: [],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    TokenURI: {
      schema: {
        tokenId: "uint256",
        tokenURI: "string",
      },
      key: ["tokenId"],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    Owners: {
      schema: {
        tokenId: "uint256",
        owner: "address",
      },
      key: ["tokenId"],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    TokenApproval: {
      schema: {
        tokenId: "uint256",
        account: "address",
      },
      key: ["tokenId"],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    OperatorApproval: {
      schema: {
        owner: "address",
        operator: "address",
        approved: "bool",
      },
      key: ["owner", "operator"],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    ERC721Registry: {
      schema: {
        namespaceId: "ResourceId",
        tokenAddress: "address",
      },
      key: ["namespaceId"],
      codegen: {
        directory: "modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
  },
  excludeSystems: ["UniqueEntitySystem", "PuppetFactorySystem", "ERC20System", "ERC721System"],
});
