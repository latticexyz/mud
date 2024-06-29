import { beforeAll, describe, expect, it, vi } from "vitest";
import { createHydratedStore, tables } from "../test/createHydratedStore";
import { deployMockGame, worldAbi } from "../../../test/mockGame";
import { writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../../test/common";
import { waitForTransaction } from "../test/waitForTransaction";
import { Has, HasValue, Not, NotValue } from "./Query";
import { defineSystem } from "./System";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("system", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [Has(tables.Position)], system);

    expect(system).toHaveBeenCalledTimes(1);
    expect(system).toHaveBeenCalledWith({
      entity: "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
      type: 0,
    });

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [1, 2],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(2);
    expect(system).toHaveBeenCalledWith({
      entity: "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
      type: 0,
    });
  });

  it("can get players at position (3, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [HasValue(tables.Position, { x: 3, y: 5 })], system);

    expect(system).toHaveBeenCalledTimes(1);
    expect(system).toHaveBeenCalledWith({
      entity: "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
      type: 0,
    });

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(2);
    expect(system).toHaveBeenCalledWith({
      entity: "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
      type: 0,
    });

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(3);
    expect(system).toHaveBeenCalledWith({
      entity: "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
      type: 0,
    });
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [Has(tables.Position), NotValue(tables.Health, { health: 0n })], system);

    expect(system).toHaveBeenCalledTimes(1);
    expect(system).toHaveBeenCalledWith({
      entity: "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
      type: 0,
    });
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [Has(tables.Position), Not(tables.Health)], system);

    expect(system).toHaveBeenCalledTimes(1);
    expect(system).toHaveBeenCalledWith({
      entity: "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
      type: 0,
    });
  });

  it("emits new subjects when initial matching set is empty", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [HasValue(tables.Position, { x: 999, y: 999 })], system);

    expect(system).toHaveBeenCalledTimes(0);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [999, 999],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(1);
    expect(system).toHaveBeenCalledWith({
      entity: "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
      type: 0,
    });
  });

  it("emits changed subjects when subscribing some time after initial query", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const system = vi.fn(() => null);
    await defineSystem(store, [HasValue(tables.Position, { x: 3, y: 5 })], system);

    expect(system).toHaveBeenCalledTimes(1);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(2);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    );
    await fetchLatestLogs();

    expect(system).toHaveBeenCalledTimes(3);
  });
});
