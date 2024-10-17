/* eslint-disable max-len */
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { snapshotAnvilState, testClient } from "../../../test-setup/common";
import { deployMockGame, worldAbi } from "../../../test-setup/mockGame";
import {
  Address,
  ContractFunctionRevertedError,
  DecodeErrorResultReturnType,
  Hex,
  SimulateContractErrorType,
  decodeErrorResult,
  decodeFunctionData,
  decodeFunctionResult,
  encodeFunctionData,
  keccak256,
  pad,
  size,
  stringToHex,
  toBytes,
} from "viem";
import storeSimulatorArtifact from "../out/StoreSimulator.sol/StoreSimulator.json";
import { readContract, simulateContract } from "viem/actions";

const storeSimulator = stringToHex("StoreSimulator", { size: 20 });
const alice = stringToHex("Alice", { size: 20 });
console.log("alice", alice);

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

    const [result, calls] = await simulateContract(testClient, {
      address: storeSimulator,
      abi: storeSimulatorAbi,
      functionName: "call",
      args: [worldAddress, callData],
      account: alice,
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
    }).then(
      () => {
        throw new Error("Simulated call did not revert with CallResult as expected.");
      },
      (e) => {
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
                  return [size(data) > 0 ? decodeFunctionResult({ abi: worldAbi, data }) : null, calls] as const;
                } else {
                  return [decodeErrorResult({ abi: worldAbi, data }), calls] as const;
                }
              }
            }
          }
        }
        throw error;
      },
    );

    expect(result).toMatchInlineSnapshot(`null`);

    // TODO: replace calls with just store events
    expect(calls.map((data) => decodeFunctionData({ abi: worldAbi, data }))).toMatchInlineSnapshot(`
      [
        {
          "args": [
            5,
            5,
          ],
          "functionName": "move",
        },
        {
          "args": [
            "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
            [
              "0x0000000000000000000000002fb283b95c5f9b601f151a91cf72fb5fa53713d7",
            ],
            "0x0000000500000005",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x",
          ],
          "functionName": "setRecord",
        },
      ]
    `);
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
