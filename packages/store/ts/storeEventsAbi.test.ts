import { describe, expect, it } from "vitest";
import { storeEventsAbi } from "./storeEventsAbi";
import IStoreAbi from "../out/IStore.sol/IStore.abi.json";
import { AbiEvent } from "abitype";

// Make sure `storeEvents` stays in sync with Solidity definition/events

function normalizeAbiEvents(abiEvents: readonly AbiEvent[]) {
  return abiEvents
    .map((item) => ({
      type: item.type,
      name: item.name,
      inputs: item.inputs.map((input) => ({
        type: input.type,
        name: input.name,
        ...(input.indexed ? { indexed: true } : null),
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

describe("storeEventsAbi", () => {
  it("should match the store ABI", () => {
    const eventsDefined = normalizeAbiEvents(storeEventsAbi);
    const eventsFromAbi = normalizeAbiEvents(
      IStoreAbi.filter((item) => item.type === "event" && item.name !== "HelloStore") as readonly AbiEvent[]
    );

    expect(eventsDefined).toMatchObject(eventsFromAbi);
  });
});
