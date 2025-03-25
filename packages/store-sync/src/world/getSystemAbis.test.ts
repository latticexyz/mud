import { parseAbiItem, createTestClient, http } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import {
  mockError,
  mockMetadata,
  mockSystem1Fn,
  mockSystem1Id,
  mockSystem2Fn,
  mockSystem2Id,
  mockSystem3Id,
} from "./mocks.test.utils";

vi.doMock("../getRecords", () => ({
  getRecords: vi.fn().mockResolvedValue({
    records: mockMetadata,
  }),
}));
const { getSystemAbis } = await import("./getSystemAbis");

describe("System ABI", () => {
  it("should return the system ABI", async () => {
    const client = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });

    const abi = await getSystemAbis({
      client,
      worldAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      systemIds: [mockSystem1Id, mockSystem2Id, mockSystem3Id],
      fromBlock: 0n,
      toBlock: 0n,
    });

    expect(abi).toEqual({
      [mockSystem1Id]: [parseAbiItem(mockSystem1Fn), parseAbiItem(mockError)],
      [mockSystem2Id]: [parseAbiItem(mockSystem2Fn), parseAbiItem(mockError)],
      [mockSystem3Id]: [],
    });
  });
});
