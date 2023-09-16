import { describe, expect, it } from "vitest";
import { storeEventsAbi } from "./storeEventsAbi";
import IStoreAbi from "../out/IStore.sol/IStore.abi.json";
import { AbiEvent } from "abitype";

// Make sure `storeEvents` stays in sync with Solidity definition/events

describe("storeEventsAbi", () => {
  it("should match the store ABI", () => {
    const expectedEvents = IStoreAbi.filter((item) => item.type === "event").filter(
      (item) => item.name !== "HelloStore"
    ) as readonly AbiEvent[];

    const expectedAbi = expectedEvents
      .map((item) => ({
        // return data in a shape that matches abitype's parseAbi
        type: item.type,
        name: item.name,
        inputs: item.inputs.map((input) => ({
          name: input.name,
          type: input.type,
          ...(input.indexed ? { indexed: true } : null),
        })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const sortedStoreEventsAbi = [...storeEventsAbi].sort((a, b) => a.name.localeCompare(b.name));
    expect(sortedStoreEventsAbi).toStrictEqual(expectedAbi);
  });
});
