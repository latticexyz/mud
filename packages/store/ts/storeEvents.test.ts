import { describe, expect, it } from "vitest";
import { parseAbiItem, AbiEvent } from "abitype";
import IStoreAbi from "../out/IStore.sol/IStore.abi.json";
import { helloStoreEvent } from "./storeEvents";

function normalizeAbiEvent(event: AbiEvent) {
  return {
    type: event.type,
    name: event.name,
    inputs: event.inputs.map((input) => ({
      type: input.type,
      name: input.name,
      ...(input.indexed ? { indexed: true } : null),
    })),
  } as const;
}

describe("Store events", () => {
  it("should match the HelloStore event ABI", () => {
    const forgeAbiItem = IStoreAbi.find((item) => item.type === "event" && item.name === "HelloStore") as AbiEvent;
    expect(normalizeAbiEvent(parseAbiItem(helloStoreEvent))).toMatchObject(normalizeAbiEvent(forgeAbiItem));
  });
});
