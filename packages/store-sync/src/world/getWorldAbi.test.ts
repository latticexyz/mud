import { createTestClient, http, parseAbi } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" with { type: "json" };
import { mockError, mockMetadata, mockWorldFn, mockWorldFn2 } from "./test/mocks";

vi.doMock("./getFunctions", () => {
  const mockGetFunctionsResult = [{ signature: "setNumber(bool)" }, { signature: "batchCall((bytes32,bytes)[])" }];
  const getFunctions = vi.fn();
  getFunctions.mockResolvedValue(mockGetFunctionsResult);

  return {
    getFunctions,
  };
});

vi.doMock("../getRecords", () => ({
  getRecords: vi.fn().mockResolvedValue({
    records: mockMetadata,
  }),
}));

const { getWorldAbi } = await import("./getWorldAbi");

describe("World ABI", () => {
  it("should return the world ABI", async () => {
    const client = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });

    const abi = await getWorldAbi({
      client,
      worldAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      fromBlock: 0n,
      toBlock: 0n,
    });

    expect(abi).toEqual([...IBaseWorldAbi, ...parseAbi([mockWorldFn, mockError, mockWorldFn2])]);
  });
});
