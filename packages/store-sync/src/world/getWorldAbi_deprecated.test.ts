import { describe, expect, it, vi } from "vitest";
import { createTestClient, http } from "viem";
import { getWorldAbi_deprecated } from "./getWorldAbi_deprecated";
import { foundry } from "viem/chains";

vi.mock("./getFunctions", () => {
  const mockGetFunctionsResult = [{ signature: "setNumber(bool)" }, { signature: "batchCall((bytes32,bytes)[])" }];
  const getFunctions = vi.fn();
  getFunctions.mockResolvedValue(mockGetFunctionsResult);

  return {
    getFunctions,
  };
});

describe("World ABI (deprecated)", () => {
  it("should concat base and world ABI", async () => {
    const client = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });
    const abi = await getWorldAbi_deprecated({
      client,
      worldAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      fromBlock: 0n,
      toBlock: 0n,
    });

    expect(abi).toContainEqual({
      inputs: [
        {
          type: "bool",
        },
      ],
      name: "setNumber",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    });

    expect(abi).not.toContainEqual({
      name: "batchCall",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [{ type: "tuple[]", components: [{ type: "bytes32" }, { type: "bytes" }] }],
      outputs: [],
    });
  });
});
