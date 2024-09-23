import { defineWorld } from "@latticexyz/world";

export default defineWorld({
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
        outputDirectory: "../modules/keyswithvalue/tables",
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
        outputDirectory: "../modules/keysintable/tables",
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
        outputDirectory: "../modules/keysintable/tables",
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
        outputDirectory: "../modules/uniqueentity/tables",
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
        outputDirectory: "../modules/std-delegations/tables",
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
        outputDirectory: "../modules/std-delegations/tables",
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
        outputDirectory: "../modules/std-delegations/tables",
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
        outputDirectory: "../modules/puppet/tables",
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
        outputDirectory: "../modules/tokens/tables",
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
        outputDirectory: "../modules/erc20-puppet/tables",
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
        outputDirectory: "../modules/erc20-puppet/tables",
        tableIdArgument: true,
      },
    },
    TotalSupply: {
      schema: {
        totalSupply: "uint256",
      },
      key: [],
      codegen: {
        outputDirectory: "../modules/erc20-puppet/tables",
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
        outputDirectory: "../modules/erc20-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
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
        outputDirectory: "../modules/erc721-puppet/tables",
        tableIdArgument: true,
      },
    },
    /************************************************************************
     *
     *    REGISTER DELEGATION WITH SIGNATURE MODULE
     *
     ************************************************************************/
    CallWithSignatureNonces: {
      schema: { signer: "address", nonce: "uint256" },
      key: ["signer"],
      codegen: {
        outputDirectory: "../modules/callwithsignature/tables",
      },
    },
  },
  excludeSystems: [
    "UniqueEntitySystem",
    "PuppetFactorySystem",
    "ERC20System",
    "ERC721System",
    "Unstable_CallWithSignatureSystem",
  ],
});
