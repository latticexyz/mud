import { createTestClient, http, parseAbi } from "viem";
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
} from "./test/mocks";

vi.doMock("../getRecords", () => ({
  getRecords: vi.fn().mockResolvedValue({
    records: mockMetadata,
  }),
}));

const { getSystemAbis } = await import("./getSystemAbis");

describe("Systems ABIs", () => {
  it("should return the systems ABIs", async () => {
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
      [mockSystem1Id]: parseAbi([mockSystem1Fn, mockError]),
      [mockSystem2Id]: parseAbi([mockSystem2Fn, mockError]),
      [mockSystem3Id]: [],
    });
  });
});
