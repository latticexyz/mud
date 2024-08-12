import { describe, expect, it } from "vitest";
import { Abi } from "viem";
import worldAbi from "./mocks/worldAbi";
import { concatBaseAbi } from "./concatBaseAbi";
import combinedAbi from "./mocks/combinedAbi";

describe("World ABI", () => {
  it("should concat base and world ABI", () => {
    const abi = concatBaseAbi(worldAbi as Abi);
    expect(abi).toMatchObject(combinedAbi);
  });
});
