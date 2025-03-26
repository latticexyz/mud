import { parseAbiItem, createTestClient, http } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { mockError, mockMetadata, mockWorldFn } from "./mocks.test.utils";

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

    expect(abi).toEqual([parseAbiItem(mockWorldFn), parseAbiItem(mockError)]);
  });
});
