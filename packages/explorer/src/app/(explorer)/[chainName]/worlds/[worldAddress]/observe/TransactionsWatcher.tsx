import { useParams } from "next/navigation";
import {
  Address,
  BaseError,
  Hash,
  Hex,
  TransactionReceipt,
  decodeFunctionData,
  getAbiItem,
  getAddress,
  parseAbi,
  parseEventLogs,
} from "viem";
import {
  PackedUserOperation,
  entryPoint07Abi,
  entryPoint07Address,
  getUserOperation,
  getUserOperationReceipt,
} from "viem/account-abstraction";
import { formatAbiItem } from "viem/utils";
import { useConfig, useWatchBlocks } from "wagmi";
import { getTransaction, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { useStore } from "zustand";
import { useCallback, useEffect } from "react";
import { store as observerStore } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { store as worldStore } from "../store";

export const doomWorldAbi = [
  {
    type: "function",
    name: "batchCall",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallData[]",
        components: [
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchCallFrom",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallFromData[]",
        components: [
          {
            name: "from",
            type: "address",
            internalType: "address",
          },
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "callFrom",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "creator",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deleteRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDynamicFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDynamicFieldSlice",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "start",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFieldLayout",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
    ],
    outputs: [
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getKeySchema",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
    ],
    outputs: [
      {
        name: "keySchema",
        type: "bytes32",
        internalType: "Schema",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStaticField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getValueSchema",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
    ],
    outputs: [
      {
        name: "valueSchema",
        type: "bytes32",
        internalType: "Schema",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantAccess",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "grantee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "initModule",
        type: "address",
        internalType: "contract IModule",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "installModule",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "contract IModule",
      },
      {
        name: "encodedArgs",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "installRootModule",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "contract IModule",
      },
      {
        name: "encodedArgs",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "popFromDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "byteLengthToPop",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pushToDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "dataToPush",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerFunctionSelector",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "systemFunctionSignature",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "worldFunctionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerSystem",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "system",
        type: "address",
        internalType: "contract System",
      },
      {
        name: "publicAccess",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerSystemHook",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract ISystemHook",
      },
      {
        name: "enabledHooksBitmap",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerTable",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
      {
        name: "keySchema",
        type: "bytes32",
        internalType: "Schema",
      },
      {
        name: "valueSchema",
        type: "bytes32",
        internalType: "Schema",
      },
      {
        name: "keyNames",
        type: "string[]",
        internalType: "string[]",
      },
      {
        name: "fieldNames",
        type: "string[]",
        internalType: "string[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeAccess",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "grantee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setStaticField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "spliceDynamicData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "startWithinField",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "deleteCount",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "spliceStaticData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "start",
        type: "uint48",
        internalType: "uint48",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "storeVersion",
    inputs: [],
    outputs: [
      {
        name: "version",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferBalanceToAddress",
    inputs: [
      {
        name: "fromNamespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "toAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferBalanceToNamespace",
    inputs: [
      {
        name: "fromNamespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "toNamespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unregisterDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unregisterNamespaceDelegation",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unregisterStoreHook",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract IStoreHook",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unregisterSystemHook",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract ISystemHook",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "worldVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "HelloStore",
    inputs: [
      {
        name: "storeVersion",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HelloWorld",
    inputs: [
      {
        name: "worldVersion",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Store_DeleteRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Store_SetRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]",
      },
      {
        name: "staticData",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        indexed: false,
        internalType: "EncodedLengths",
      },
      {
        name: "dynamicData",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Store_SpliceDynamicData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]",
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
      {
        name: "start",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
      {
        name: "deleteCount",
        type: "uint40",
        indexed: false,
        internalType: "uint40",
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        indexed: false,
        internalType: "EncodedLengths",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Store_SpliceStaticData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]",
      },
      {
        name: "start",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "EncodedLengths_InvalidLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_Empty",
    inputs: [],
  },
  {
    type: "error",
    name: "FieldLayout_InvalidStaticDataLength",
    inputs: [
      {
        name: "staticDataLength",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "computedStaticDataLength",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthDoesNotFitInAWord",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthIsNotZero",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthIsZero",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_TooManyDynamicFields",
    inputs: [
      {
        name: "numFields",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxFields",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "FieldLayout_TooManyFields",
    inputs: [
      {
        name: "numFields",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxFields",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Module_AlreadyInstalled",
    inputs: [],
  },
  {
    type: "error",
    name: "Module_MissingDependency",
    inputs: [
      {
        name: "dependency",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "Module_NonRootInstallNotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "Module_RootInstallNotSupported",
    inputs: [],
  },
  {
    type: "error",
    name: "Schema_InvalidLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Schema_StaticTypeAfterDynamicType",
    inputs: [],
  },
  {
    type: "error",
    name: "Slice_OutOfBounds",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "start",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_IndexOutOfBounds",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "accessedIndex",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidBounds",
    inputs: [
      {
        name: "start",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidFieldNamesLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidKeyNamesLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidResourceType",
    inputs: [
      {
        name: "expected",
        type: "bytes2",
        internalType: "bytes2",
      },
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidSplice",
    inputs: [
      {
        name: "startWithinField",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "deleteCount",
        type: "uint40",
        internalType: "uint40",
      },
      {
        name: "fieldLength",
        type: "uint40",
        internalType: "uint40",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidStaticDataLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaDynamicLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaStaticLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Store_TableAlreadyExists",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "tableIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "Store_TableNotFound",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "tableIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "World_AccessDenied",
    inputs: [
      {
        name: "resource",
        type: "string",
        internalType: "string",
      },
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "World_AlreadyInitialized",
    inputs: [],
  },
  {
    type: "error",
    name: "World_CallbackNotAllowed",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "World_DelegationNotFound",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "World_FunctionSelectorAlreadyExists",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "World_FunctionSelectorNotFound",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "World_InsufficientBalance",
    inputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "World_InterfaceNotSupported",
    inputs: [
      {
        name: "contractAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "World_InvalidNamespace",
    inputs: [
      {
        name: "namespace",
        type: "bytes14",
        internalType: "bytes14",
      },
    ],
  },
  {
    type: "error",
    name: "World_InvalidResourceId",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "World_InvalidResourceType",
    inputs: [
      {
        name: "expected",
        type: "bytes2",
        internalType: "bytes2",
      },
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "World_ResourceAlreadyExists",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "World_ResourceNotFound",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "World_SystemAlreadyExists",
    inputs: [
      {
        name: "system",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "World_UnlimitedDelegationNotAllowed",
    inputs: [],
  },
  {
    name: "send",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "uint256",
      },
      {
        type: "uint32[]",
      },
      {
        type: "bytes",
      },
    ],
    outputs: [],
  },
  {
    name: "metadata__getResourceTag",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "bytes32",
      },
      {
        type: "bytes32",
      },
    ],
    outputs: [],
  },
  {
    name: "metadata__setResourceTag",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "bytes32",
      },
      {
        type: "bytes32",
      },
      {
        type: "bytes",
      },
    ],
    outputs: [],
  },
  {
    name: "metadata__deleteResourceTag",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "bytes32",
      },
      {
        type: "bytes32",
      },
    ],
    outputs: [],
  },
];

export const userOperationEventAbi = {
  type: "event",
  name: "UserOperationEvent",
  inputs: [
    {
      type: "bytes32",
      name: "userOpHash",
      indexed: true,
    },
    {
      type: "address",
      name: "sender",
      indexed: true,
    },
    {
      type: "address",
      name: "paymaster",
      indexed: true,
    },
    {
      type: "uint256",
      name: "nonce",
      indexed: false,
    },
    {
      type: "bool",
      name: "success",
      indexed: false,
    },
    {
      type: "uint256",
      name: "actualGasCost",
      indexed: false,
    },
    {
      type: "uint256",
      name: "actualGasUsed",
      indexed: false,
    },
  ],
} as const;

export function TransactionsWatcher() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams<{ worldAddress: Address }>();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const { transactions, setTransaction, updateTransaction } = useStore(worldStore);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const handleTransaction = useCallback(
    async ({ hash, writeId, timestamp }: { hash: Hash; writeId: string; timestamp: bigint }) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash });
      if (transaction.to && getAddress(transaction.to) === getAddress(entryPoint07Address)) {
        const write = observerWrites[writeId];
        if (!write) return;

        const receiptEvent = write["events"].find((event) => event.type === "waitForUserOperationReceipt:result");
        if (!receiptEvent) return;

        const receipt = receiptEvent.receipt;
        const hash = receipt.transactionHash;
        const decodedEntryPointCall = decodeFunctionData({
          abi: entryPoint07Abi,
          data: transaction.input,
        });

        const userOps = decodedEntryPointCall.args[0] as PackedUserOperation[];
        const worldTo = decodedEntryPointCall.args[1] as Address;

        // TODO: handle several userOps
        for (const userOp of userOps) {
          const decodedSmartAccountCall = decodeFunctionData({
            abi: parseAbi([
              "function execute(address target, uint256 value, bytes calldata data)",
              "function executeBatch((address target,uint256 value,bytes data)[])",
            ]),
            data: userOp.callData,
          });

          const calls = decodedSmartAccountCall.args[0].map((worldFunction) => {
            let functionName: string | undefined;
            let args: readonly unknown[] | undefined;
            // let transactionError: BaseError | undefined; // TODO: what to do with this?
            try {
              const functionData = decodeFunctionData({ abi: doomWorldAbi, data: worldFunction.data });
              functionName = functionData.functionName;
              args = functionData.args;
            } catch (error) {
              // transactionError = error as BaseError;
              functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
            }

            const functionAbiItem = getAbiItem({
              abi: doomWorldAbi,
              name: functionName,
              args,
            } as never);

            return {
              to: worldFunction.target,
              functionSignature: functionAbiItem ? formatAbiItem(functionAbiItem) : "unknown",
              functionName,
              args,
            };
          });

          setTransaction({
            hash,
            writeId: writeId ?? hash,
            from: transaction.from,
            timestamp,
            transaction,
            status: "pending",
            calls,
            value: transaction.value,
          });

          const logs = parseEventLogs({
            abi: [...abi, userOperationEventAbi],
            logs: receipt.logs,
          });

          updateTransaction(hash, {
            receipt,
            logs,
            status: "success", // TODO: correct status check
            error: undefined, // TODO: transactionError as BaseError,
          });

          return;
        }
      } else if (transaction.to && getAddress(transaction.to) === getAddress(worldAddress)) {
        let functionName: string | undefined;
        let args: readonly unknown[] | undefined;
        let transactionError: BaseError | undefined;

        try {
          const functionData = decodeFunctionData({ abi, data: transaction.input });
          functionName = functionData.functionName;
          args = functionData.args;
        } catch (error) {
          transactionError = error as BaseError;
          functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
        }

        setTransaction({
          hash,
          writeId: writeId ?? hash,
          from: transaction.from,
          timestamp,
          transaction,
          status: "pending",
          functionData: {
            functionName,
            args,
          },
          value: transaction.value,
        });

        // TODO: reuse receipt from observer if tx successful
        let receipt: TransactionReceipt | undefined;
        try {
          receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        } catch {
          console.error(`Failed to fetch transaction receipt. Transaction hash: ${hash}`);
        }

        if (receipt && receipt.status === "reverted" && functionName) {
          try {
            // Simulate the failed transaction to retrieve the revert reason
            // Note, it only works for functions that are declared in the ABI
            // See: https://github.com/wevm/viem/discussions/462
            await simulateContract(wagmiConfig, {
              account: transaction.from,
              address: worldAddress,
              abi,
              value: transaction.value,
              blockNumber: receipt.blockNumber,
              functionName,
              args,
            });
          } catch (error) {
            transactionError = error as BaseError;
          }
        }

        const status = receipt ? receipt.status : "unknown";
        const logs = parseEventLogs({
          abi,
          logs: receipt?.logs || [],
        });

        updateTransaction(hash, {
          receipt,
          logs,
          status,
          error: transactionError as BaseError,
        });
      }
    },
    [abi, wagmiConfig, worldAddress, observerWrites, setTransaction, updateTransaction],
  );

  useEffect(() => {
    for (const write of Object.values(observerWrites)) {
      const hash = write.hash;
      if (hash) {
        // TODO: add back -> && write.address.toLowerCase() === worldAddress.toLowerCase()
        const transaction = transactions.find((transaction) => transaction.hash === hash);
        if (!transaction) {
          handleTransaction({ hash, writeId: write.writeId, timestamp: BigInt(write.time) / 1000n });
        }
      }
    }
  }, [handleTransaction, observerWrites, transactions, worldAddress]);

  // useWatchBlocks({
  //   onBlock(block) {
  //     for (const hash of block.transactions) {
  //       if (transactions.find((transaction) => transaction.hash === hash)) continue;
  //       handleTransaction({ hash, timestamp: block.timestamp });
  //     }
  //   },
  //   chainId,
  //   pollingInterval: 500,
  // });

  return null;
}
