import { describe, expect, it } from "vitest";
import { storeEventsAbi } from "./storeEventsAbi";
import IStoreAbi from "../abi-ts/IStore.sol/IStore";

// Make sure `storeEvents` stays in sync with Solidity definition/events

describe("storeEventsAbi", () => {
  it("should match the store ABI", () => {
    const expectedAbi = IStoreAbi.filter((item) => item.type === "event")
      .map((item) => ({
        // just return data that abitype cares about
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

    const sortedStoreEventsAbi = [...storeEventsAbi].sort((a, b) => a.name.localeCompare(b.name));
    expect(sortedStoreEventsAbi).toStrictEqual(expectedAbi);
  });
});
