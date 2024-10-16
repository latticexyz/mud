/* eslint-disable max-len */
import { beforeAll, beforeEach, describe, it } from "vitest";
import { snapshotAnvilState, testClient } from "../../../test-setup/common";
import { deployMockGame, worldAbi } from "../../../test-setup/mockGame";
import { Address, Hex, encodeFunctionData, stringToHex } from "viem";
import storeSimulatorArtifact from "../out/StoreSimulator.sol/StoreSimulator.json";
import storeSimulatorAbi from "../out/StoreSimulator.sol/StoreSimulator.abi.json";
import { simulateContract } from "viem/actions";

const storeSimulator = stringToHex("StoreSimulator", { size: 20 });

describe("storeSimulator", async () => {
  let worldAddress: Address;

  beforeAll(async () => {
    const resetAnvilState = await snapshotAnvilState();
    worldAddress = await deployMockGame();
    await testClient.setCode({
      address: storeSimulator,
      bytecode: storeSimulatorArtifact.deployedBytecode.object as Hex,
    });
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
    });

    console.log("got result", result);
  });
});
