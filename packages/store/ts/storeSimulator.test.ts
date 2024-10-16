/* eslint-disable max-len */
import { beforeAll, beforeEach, describe, it } from "vitest";
import { snapshotAnvilState, testClient } from "../../../test-setup/common";
import { deployMockGame, worldAbi } from "../../../test-setup/mockGame";
import {
  Address,
  ContractFunctionRevertedError,
  DecodeErrorResultReturnType,
  Hex,
  SimulateContractErrorType,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
  keccak256,
  pad,
  parseAbi,
  stringToHex,
  toBytes,
} from "viem";
import storeSimulatorArtifact from "../out/StoreSimulator.sol/StoreSimulator.json";
import { readContract, simulateContract } from "viem/actions";

const storeSimulator = stringToHex("StoreSimulator", { size: 20 });

describe("storeSimulator", async () => {
  let worldAddress: Address;
  let proxyAddress: Address;

  beforeAll(async () => {
    const resetAnvilState = await snapshotAnvilState();
    worldAddress = await deployMockGame();
    await testClient.setCode({
      address: storeSimulator,
      bytecode: storeSimulatorArtifact.deployedBytecode.object as Hex,
    });
    proxyAddress = await readContract(testClient, {
      address: storeSimulator,
      abi: storeSimulatorAbi,
      functionName: "getProxyAddress",
      args: [worldAddress],
    });
    console.log("world address", worldAddress);
    console.log("proxy address", proxyAddress);
    return resetAnvilState;
  });
  beforeEach(snapshotAnvilState);

  it("can simulate a world call", async () => {
    const callData = encodeFunctionData({
      abi: worldAbi,
      functionName: "move",
      args: [5, 5],
    });

    const result = await simulateContract(testClient, {
      address: storeSimulator,
      abi: storeSimulatorAbi,
      functionName: "call",
      args: [worldAddress, callData],
      // account: worldAddress,
      stateOverride: [
        {
          address: worldAddress,
          stateDiff: [
            {
              slot: keccak256(toBytes("mud.store.storage.StoreSwitch")),
              value: pad(proxyAddress, { size: 32 }),
            },
          ],
        },
      ],
    }).catch((e) => {
      const error = e as SimulateContractErrorType;
      // throw error;
      if (error.name === "ContractFunctionExecutionError") {
        if (error.cause instanceof ContractFunctionRevertedError) {
          if (error.cause.data) {
            const callResult = error.cause.data as DecodeErrorResultReturnType<storeSimulatorAbi>;
            if (callResult.errorName === "CallResult") {
              const [success, data, calls] = callResult.args;
              console.log("got calls", calls);
              if (success) {
                return decodeFunctionResult({ abi: worldAbi, data });
              } else {
                return decodeErrorResult({ abi: worldAbi, data });
              }
            }
          }
        }
      }
      throw error;
    });

    console.log("got result", result);
    console.dir(result, { depth: null });
  });
});

const storeSimulatorAbi = [
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "store",
        type: "address",
        internalType: "address",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getProxyAddress",
    inputs: [
      {
        name: "store",
        type: "address",
        internalType: "address",
      },
    ],
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
    type: "error",
    name: "CallResult",
    inputs: [
      {
        name: "success",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "calls",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
  },
  {
    type: "error",
    name: "Create2EmptyBytecode",
    inputs: [],
  },
  {
    type: "error",
    name: "FailedDeployment",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
] as const;
type storeSimulatorAbi = typeof storeSimulatorAbi;
