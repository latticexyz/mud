import { describe, expect, it } from "vitest";
import { storeEventsAbi } from "./storeEventsAbi";
import { IStore__factory } from "../types/ethers-contracts";

// Make sure `storeEvents` stays in sync with Solidity definition/events

describe("storeEventsAbi", () => {
  it("should match the store ABI", () => {
    const expectedAbi = IStore__factory.abi
      .filter((item) => item.type === "event")
      .map((item) => ({
        // transform because typechain adds a bunch of data that abitype doesn't care about
        type: item.type,
        name: item.name,
        inputs: [
          ...item.inputs.map((input) => ({
            name: input.name,
            type: input.type,
          })),
        ],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const sortedStoreEventsAbi = storeEventsAbi.slice().sort((a, b) => a.name.localeCompare(b.name));
    expect(sortedStoreEventsAbi).toStrictEqual(expectedAbi);
  });
});
