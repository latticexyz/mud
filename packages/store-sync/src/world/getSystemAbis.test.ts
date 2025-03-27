import { createTestClient, http, parseAbi } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi, beforeEach } from "vitest";
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
  let client;
  const baseParams = {
    worldAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    fromBlock: 0n,
    toBlock: 0n,
  };

  beforeEach(() => {
    client = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });
  });

  it("should return queried systems ABIs", async () => {
    const abi = await getSystemAbis({
      ...baseParams,
      client,
      systemIds: [mockSystem1Id, mockSystem3Id],
    });

    expect(abi).toEqual({
      [mockSystem1Id]: parseAbi([mockSystem1Fn, mockError]),
      [mockSystem3Id]: [],
    });
  });

  it("should return all systems ABIs", async () => {
    const abi = await getSystemAbis({
      ...baseParams,
      client,
    });

    expect(abi).toEqual({
      [mockSystem1Id]: parseAbi([mockSystem1Fn, mockError]),
      [mockSystem2Id]: parseAbi([mockSystem2Fn, mockError]),
    });
  });
});
