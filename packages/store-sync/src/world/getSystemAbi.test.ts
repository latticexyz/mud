import { parseAbiItem, createTestClient, http } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { mockError, mockMetadata, mockSystem1Fn, mockSystem1Id } from "./mocks.test.utils";

vi.doMock("../getRecords", () => ({
  getRecords: vi.fn().mockResolvedValue({
    records: mockMetadata,
  }),
}));
const { getSystemAbi } = await import("./getSystemAbi");

describe("System ABI", () => {
  it("should return the system ABI", async () => {
    const client = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });

    const abi = await getSystemAbi({
      client,
      worldAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      systemId: mockSystem1Id,
      fromBlock: 0n,
      toBlock: 0n,
    });

    expect(abi).toEqual([parseAbiItem(mockSystem1Fn), parseAbiItem(mockError)]);
  });
});
