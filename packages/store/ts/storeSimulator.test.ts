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
    expect(calls).toMatchInlineSnapshot(`
      [
        "0xb591186e00000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000005",
        "0x298314fb74620000000000000000000000000000506f736974696f6e000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000aaadeca8087c6a96822fd24e6d906c4677a09f90000000000000000000000000000000000000000000000000000000000000000800000005000000050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
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
